import { AlefError, isPrefixedId, PrefixedId } from '@alef/common';
import { zValidator } from '@hono/zod-validator';
import { Context, Hono } from 'hono';
import { getConnInfo } from 'hono/cloudflare-workers';
import { createMiddleware } from 'hono/factory';
import { z } from 'zod';
import { wrapRpcData } from '../../helpers/wrapRpcData';
import { sessionMiddleware, userStoreMiddleware } from '../../middleware/session';
import { assignOrRefreshDeviceId } from '../auth/devices';
import { sessions } from '../auth/session';
import { Bindings, Env } from '../config/ctx';

/**
 * Middleware that ensures the connecting device is recorded in the database,
 * associated with the current user if logged in, and applying a ?description value
 * if provided.
 */
const upsertDeviceMiddleware = createMiddleware<{
	Variables: Env['Variables'] & {
		device: { id: PrefixedId<'d'>; name: string };
	};
	Bindings: Env['Bindings'];
}>(async (ctx, next) => {
	// upsert the device upon connection. if an authenticated user is present, associates the device with them
	// implicitly.
	const description = ctx.req.query('description');
	const userId = ctx.get('session')?.userId;
	const ownId = await assignOrRefreshDeviceId(ctx);
	const device = {
		name: description,
		id: ownId,
	};
	const upserted = await ctx.env.PUBLIC_STORE.ensureDeviceExists(device, userId);
	ctx.set('device', upserted);
	return next();
});

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
				description: z.string().optional(),
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
		userStoreMiddleware,
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
				description: z.string().optional(),
			})
		),
		upsertDeviceMiddleware,
		async (ctx) => {
			const userId = ctx.get('session')?.userId;
			const device = ctx.get('device');
			const ownId = device.id;

			await ctx.env.PUBLIC_STORE.ensureDeviceExists(device, userId);
			const discoveryState = await getDiscoveryState(ctx);
			discoveryState.register(device);
			const list = await discoveryState.listAll(device.id);

			// if this device is already registered, it is assigned an authentication token
			let wasAssigned = false;
			if (!userId) {
				const accessList = await ctx.env.PUBLIC_STORE.getDeviceAccess(ownId);
				if (accessList.length !== 0) {
					// arbitrarily choose one user from those who have access to this device.
					const assignedUserId = accessList[0].userId;
					const userStore = await ctx.env.PUBLIC_STORE.getStoreForUser(assignedUserId);
					const user = await userStore.getMe();
					if (!user) {
						throw new AlefError(AlefError.Code.InternalServerError, 'Could not find user for device.');
					}
					const updates = await sessions.updateSession(
						{
							isProductAdmin: user.isProductAdmin,
							name: user.name,
							userId: assignedUserId,
							// TODO: don't ditch types here... while this is all the same ctx value,
							// the types applied to SessionManager are particular.
						},
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
		userStoreMiddleware,
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
		userStoreMiddleware,
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
	console.log(discoveryState);
	return discoveryState;
}
