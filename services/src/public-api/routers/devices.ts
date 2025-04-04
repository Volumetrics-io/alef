import { AlefError, isPrefixedId, PrefixedId } from '@alef/common';
import { zValidator } from '@hono/zod-validator';
import { Context, Hono } from 'hono';
import { getConnInfo } from 'hono/cloudflare-workers';
import { z } from 'zod';
import { wrapRpcData } from '../../helpers/wrapRpcData';
import { upsertDeviceMiddleware } from '../../middleware/devices';
import { sessionMiddleware, userStoreMiddleware, writeAccessMiddleware } from '../../middleware/session';
import { assignOrRefreshDeviceId } from '../auth/devices';
import { sessions } from '../auth/session';
import { Bindings, Env } from '../config/ctx';

export const devicesRouter = new Hono<Env>()
	.get('/', userStoreMiddleware, async (ctx) => {
		const ownId = await assignOrRefreshDeviceId(ctx);
		const devices = await ctx.get('userStore').getAccessibleDevices();
		return ctx.json(
			wrapRpcData(devices).map((device) => ({
				...device,
				isSelf: device.id === ownId,
			}))
		);
	})
	.get(
		'/self',
		zValidator(
			'query',
			z.object({
				name: z.string().optional(),
				// required: some baseline description of what this device is, absent any other naming.
				description: z.string(),
				type: z.enum(['mobile', 'tablet', 'headset', 'desktop', 'other']).optional(),
			})
		),
		sessionMiddleware,
		upsertDeviceMiddleware,
		async (ctx) => {
			const ownId = ctx.get('device').id;
			const session = ctx.get('session');
			if (!session) {
				const publicDevice = await ctx.env.PUBLIC_STORE.getDevice(ownId);
				return ctx.json(
					wrapRpcData({
						...publicDevice,
						displayMode: 'viewing',
						name: '',
					})
				);
			}
			// ensure access to the device by refetching it here with the user's authorized store
			const accessedDevice = await ctx.env.PUBLIC_STORE.getStoreForUser(session.userId).getDevice(ownId);
			if (!accessedDevice) {
				throw new AlefError(AlefError.Code.NotFound, 'Could not find device.');
			}
			return ctx.json(wrapRpcData(accessedDevice));
		}
	)
	.get('/refresh', async (ctx) => {
		// this endpoint just serves to refresh device identity assignment
		await assignOrRefreshDeviceId(ctx);
		return ctx.json({ ok: true });
	})
	.post(
		'/:deviceId/claim',
		writeAccessMiddleware,
		zValidator(
			'param',
			z.object({
				deviceId: z.custom<PrefixedId<'d'>>((v) => isPrefixedId(v, 'd')),
			})
		),
		async (ctx) => {
			const { deviceId } = ctx.req.valid('param');
			await ctx.get('userStore').claimDevice(deviceId);
			// remove device from claim suggestions
			const discoveryState = await getDiscoveryState(ctx);
			const ownId = await assignOrRefreshDeviceId(ctx);
			await discoveryState.claim(ownId, deviceId);
			return ctx.json({
				ok: true,
			});
		}
	)
	.post(
		'/paircode/:code/claim',
		writeAccessMiddleware,
		zValidator(
			'param',
			z.object({
				code: z.string(),
			})
		),
		async (ctx) => {
			const { code } = ctx.req.valid('param');
			const paircodes = await getPaircodes(ctx);
			const deviceId = await paircodes.claim(code);
			if (!deviceId) {
				throw new AlefError(AlefError.Code.NotFound, 'No match found for that code. Double-check it.');
			}
			await ctx.get('userStore').claimDevice(deviceId);
			return ctx.json({
				ok: true,
			});
		}
	)
	// device discovery uses a Durable Object per public IP to register devices which are simultaneously
	// connected and allow them to claim one another.
	// This is also a public endpoint! Devices which aren't discovered or assigned yet aren't authenticated
	// and they need to use this to get there.
	.get(
		'/discover',
		sessionMiddleware,
		zValidator(
			'query',
			z.object({
				name: z.string().optional(),
				// required: some baseline description of what this device is, absent any other naming.
				description: z.string(),
				type: z.enum(['mobile', 'tablet', 'headset', 'desktop', 'other']).optional(),
			})
		),
		upsertDeviceMiddleware,
		async (ctx) => {
			const userId = ctx.get('session')?.userId;
			const device = ctx.get('device');
			const ownId = device.id;

			const discoveryState = await getDiscoveryState(ctx);
			discoveryState.register(device);
			const list = await discoveryState.listAll(device.id);

			let code: string | null = null;
			// only enable paircodes for devices that are not yet registered
			if (!userId) {
				const paircodes = await getPaircodes(ctx);
				code = await paircodes.register(device.id);
			}

			// if this device is already registered, it is assigned an authentication token
			let wasAssigned = false;
			if (!userId) {
				const accessList = await ctx.env.PUBLIC_STORE.getDeviceAccess(ownId);
				if (accessList.length !== 0) {
					// arbitrarily choose one user from those who have access to this device.
					const assigned = accessList[0];
					const userStore = await ctx.env.PUBLIC_STORE.getStoreForUser(assigned.userId);
					const user = await userStore.getMe();
					if (!user) {
						throw new AlefError(AlefError.Code.InternalServerError, 'Could not find user for device.');
					}
					const updates = await sessions.updateSession(
						{
							isProductAdmin: user.isProductAdmin,
							name: user.name,
							userId: assigned.userId,
							deviceId: ownId,
							access: assigned.access,
						},
						// TODO: don't ditch types here... while this is all the same ctx value,
						// the types applied to SessionManager are particular.
						ctx as unknown as Context<Env>
					);
					for (const [key, value] of updates.headers) {
						ctx.header(key, value, {
							append: true,
						});
					}
					wasAssigned = true;
				}
			}

			return ctx.json(
				wrapRpcData({
					...list,
					wasAssigned,
					paircode: code,
				})
			);
		}
	)
	// sent from headset to phone, recommending itself to the phone for pairing. the process
	// has to initiate on the headset since it's on the user's face, but it has to be claimed
	// on the phone because it's the one logged in.
	.post(
		'/discover/suggest',
		zValidator(
			'json',
			z.object({
				deviceId: z.custom<PrefixedId<'d'>>((v) => isPrefixedId(v, 'd')),
			})
		),
		async (ctx) => {
			const ownId = await assignOrRefreshDeviceId(ctx);
			const discoveryState = await getDiscoveryState(ctx);
			const { deviceId } = ctx.req.valid('json');
			await discoveryState.suggest(ownId, deviceId);
			return ctx.json({ ok: true });
		}
	)
	.delete(
		'/:deviceId',
		writeAccessMiddleware,
		zValidator(
			'param',
			z.object({
				deviceId: z.custom<PrefixedId<'d'>>((v) => isPrefixedId(v, 'd')),
			})
		),
		async (ctx) => {
			const { deviceId } = ctx.req.valid('param');
			await ctx.get('userStore').deleteDevice(deviceId);
			return ctx.json({ ok: true });
		}
	)
	.put(
		'/:deviceId',
		writeAccessMiddleware,
		zValidator(
			'param',
			z.object({
				deviceId: z.custom<PrefixedId<'d'>>((v) => isPrefixedId(v, 'd')),
			})
		),
		zValidator(
			'json',
			z.object({
				displayMode: z.enum(['staging', 'viewing']).optional(),
				name: z.string().optional(),
				type: z.enum(['mobile', 'headset', 'desktop', 'other']).optional(),
			})
		),
		async (ctx) => {
			const { deviceId } = ctx.req.valid('param');
			const updates = ctx.req.valid('json');
			const updated = await ctx.get('userStore').updateDevice(deviceId, updates);
			return ctx.json(wrapRpcData(updated));
		}
	);

async function getDiscoveryState(ctx: Context<{ Bindings: Bindings; Variables: any }>) {
	const info = getConnInfo(ctx);
	const ip = info.remote.address;

	if (!ip) {
		// cannot do discovery without a public IP
		throw new AlefError(AlefError.Code.BadRequest, 'Could not detect your device network for discovery.');
	}

	const durableObjectId = ctx.env.DEVICE_DISCOVERY.idFromName(ip);
	const discoveryState = ctx.env.DEVICE_DISCOVERY.get(durableObjectId);
	return discoveryState;
}

async function getPaircodes(ctx: Context<{ Bindings: Bindings; Variables: any }>) {
	const durableObjectId = ctx.env.PAIRCODES.idFromName('paircodes');
	const paircodes = ctx.env.PAIRCODES.get(durableObjectId);
	return paircodes;
}
