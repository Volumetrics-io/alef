import { DeviceType, PrefixedId } from '@alef/common';
import { createMiddleware } from 'hono/factory';
import { assignOrRefreshDeviceId } from '../public-api/auth/devices';
import { Env } from '../public-api/config/ctx';

/**
 * Middleware that ensures the connecting device is recorded in the database,
 * associated with the current user if logged in, and applying a ?description value
 * if provided.
 *
 * WARNING: upserted device will always have write:all access unless it has
 * a session already, in which case it copies session access.
 */
export const upsertDeviceMiddleware = createMiddleware<{
	Variables: Env['Variables'] & {
		device: { id: PrefixedId<'d'>; name: string };
	};
	Bindings: Env['Bindings'];
}>(async (ctx, next) => {
	// upsert the device upon connection. if an authenticated user is present, associates the device with them
	// implicitly.
	const name = ctx.req.query('name') ?? 'Unknown device';
	const type = ctx.req.query('type') as DeviceType | undefined;
	const description = ctx.req.query('description');
	const userId = ctx.get('session')?.userId;
	const access = ctx.get('session')?.access ?? 'write:all';
	const ownId = await assignOrRefreshDeviceId(ctx);
	const device = {
		id: ownId,
		name,
		defaultName: description,
		type,
		access,
	};
	const upserted = await ctx.env.PUBLIC_STORE.ensureDeviceExists(device, userId);
	ctx.set('device', upserted);
	await next();
});
