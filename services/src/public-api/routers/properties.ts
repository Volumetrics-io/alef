import { AlefError, isPrefixedId, PrefixedId } from '@alef/common';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';
import { z } from 'zod';
import { wrapRpcData } from '../../helpers/wrapRpcData';
import { loggedInMiddleware, userStoreMiddleware } from '../../middleware/session';
import { getSocketToken } from '../auth/socketTokens';
import { Env, EnvWith } from '../config/ctx';
import { Property } from '../durableObjects/Property';

const loadPropertyStore = createMiddleware<{
	Variables: Env['Variables'] & { property: DurableObjectStub<Property>; propertyId: PrefixedId<'p'> };
	Bindings: Env['Bindings'];
}>(async (ctx, next) => {
	const propertyId = ctx.req.param('id');
	if (!propertyId) {
		throw new AlefError(AlefError.Code.NotFound, 'property not found');
	}
	if (!isPrefixedId(propertyId, 'p')) {
		throw new AlefError(AlefError.Code.BadRequest, 'Invalid property ID');
	}
	const propertyDOId = ctx.env.PROPERTY.idFromName(propertyId);
	const property = ctx.env.PROPERTY.get(propertyDOId);
	ctx.set('property', property);
	ctx.set('propertyId', propertyId);
	await next();
});

// session is guaranteed by loggedInMiddleware higher in router stack
const propertyRouter = new Hono<EnvWith<'session'>>()
	.use(loadPropertyStore)
	.get('/', async (ctx) => {
		const property = ctx.get('property');
		const state = await property.getAllRooms();
		return ctx.json(wrapRpcData(state));
	})
	.get('/rooms/:roomId', zValidator('param', z.object({ roomId: z.custom<PrefixedId<'r'>>((v) => isPrefixedId(v, 'r')) })), async (ctx) => {
		const property = ctx.get('property');
		const roomId = ctx.req.valid('param').roomId;
		const state = await property.getRoom(roomId);
		return ctx.json(wrapRpcData(state));
	})
	.get('/socketToken', async (ctx) => {
		const session = ctx.get('session');
		if (!session) {
			throw new AlefError(AlefError.Code.Unauthorized, 'Not logged in');
		}
		const token = await getSocketToken(session, ctx.get('propertyId'), ctx.env.SOCKET_TOKEN_SECRET);
		return ctx.json({ token });
	});

export const propertiesRouter = new Hono<Env>()
	.use(loggedInMiddleware)
	.use('/:id', zValidator('param', z.object({ id: z.custom((v) => isPrefixedId<'p'>(v, 'p')) })))
	.route('/:id', propertyRouter)
	.get('/', userStoreMiddleware, async (ctx) => {
		const state = await ctx.get('userStore').getAllProperties();
		if (!state.length) {
			// TEMP: MVP: insert a default property.
			// This will be removed once we have a way to create and manage properties.
			const defaultProperty = await ctx.get('userStore').insertProperty('Default Property');
			return ctx.json(wrapRpcData([defaultProperty]));
		}
		return ctx.json(wrapRpcData(state));
	});
