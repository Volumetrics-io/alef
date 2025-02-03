import { AlefError } from '@alef/common';
import { Hono } from 'hono';
import { wrapRpcData } from '../../helpers/wrapRpcData.js';
import { userStoreMiddleware } from '../../middleware/session.js';
import { Env } from '../config/ctx.js';

export const usersRouter = new Hono<Env>().get('/me', userStoreMiddleware, async (ctx) => {
	const session = await ctx.get('userStore').getMe();
	if (!session) {
		throw new AlefError(AlefError.Code.Unauthorized, 'Not logged in');
	}
	const data = wrapRpcData(session);
	return ctx.json(data);
});
