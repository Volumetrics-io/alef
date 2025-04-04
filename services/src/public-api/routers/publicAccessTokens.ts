import { AlefError } from '@alef/common';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { wrapRpcData } from '../../helpers/wrapRpcData';
import { upsertDeviceMiddleware } from '../../middleware/devices';
import { writeAccessMiddleware } from '../../middleware/session';
import { sessions } from '../auth/session';
import { Env } from '../config/ctx';

export const publicAccessTokensRouter = new Hono<Env>()
	.put('/default', writeAccessMiddleware, async (ctx) => {
		// get or create the default public access token for a user
		const token = await ctx.get('userStore').upsertDefaultPublicAccessToken();
		return ctx.json(wrapRpcData(token));
	})
	.get('/:token/redeem', upsertDeviceMiddleware, zValidator('param', z.object({ token: z.string() })), async (ctx) => {
		const token = ctx.req.valid('param').token;
		const tokenData = await ctx.env.PUBLIC_STORE.getPublicAccessToken(token);
		if (!tokenData) {
			throw new AlefError(AlefError.Code.BadRequest, 'Invalid or expired token');
		}
		const userStore = await ctx.env.PUBLIC_STORE.getStoreForUser(tokenData.userId);
		const user = await userStore.getMe();
		if (!user) {
			throw new AlefError(AlefError.Code.BadRequest, 'Invalid or expired token (user not found)');
		}
		const updates = await sessions.updateSession(
			{
				isProductAdmin: user?.isProductAdmin,
				name: user.name,
				userId: user.id,
				deviceId: ctx.get('device').id,
			},
			ctx as any
		);
		for (const [key, value] of updates.headers) {
			ctx.header(key, value, {
				append: true,
			});
		}
		return ctx.json({ success: true });
	});
