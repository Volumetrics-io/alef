import { AlefError } from '@alef/common';
import { Hono } from 'hono';
import { userStoreMiddleware } from '../../middleware/session.js';
import { Env } from '../config/ctx.js';

export const usersRouter = new Hono<Env>().get('/me', userStoreMiddleware, async (ctx) => {
	const session = await ctx.get('userStore').getSession();
	if (!session) {
		throw new AlefError(AlefError.Code.Unauthorized, 'Not logged in');
	}
	return ctx.json(session);
});
