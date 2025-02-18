import { AlefError } from '@alef/common';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { wrapRpcData } from '../../helpers/wrapRpcData.js';
import { userStoreMiddleware } from '../../middleware/session.js';
import { Env } from '../config/ctx.js';
import { email } from '../services/email.js';

export const usersRouter = new Hono<Env>()
	.get('/me', userStoreMiddleware, async (ctx) => {
		const session = await ctx.get('userStore').getMe();
		if (!session) {
			throw new AlefError(AlefError.Code.Unauthorized, 'Not logged in');
		}
		const data = wrapRpcData(session);
		return ctx.json(data);
	})
	.post('/requestDemo', zValidator('json', z.object({ email: z.string().email() })), async (ctx) => {
		const { email: to } = ctx.req.valid('json');
		await email.sendCustomEmail(
			{
				to: 'volumetricsowner@gmail.com',
				subject: `Demo Request from ${to}`,
				html: `<p>${to} has requested an Alef demo</p>`,
				text: `${to} has requested an Alef demo`,
			},
			ctx
		);
		return ctx.json({ success: true });
	});
