import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import * as z from 'zod';
import { Env } from '../config/ctx.js';

export const usersRouter = new Hono<Env>().post(
	'/',
	zValidator(
		'json',
		z.object({
			email: z.string().email(),
			name: z.string(),
			password: z.string().min(8),
		})
	),
	async (ctx) => {
		const { email, name, password } = ctx.req.valid('json');
		const adminStore = ctx.env.ADMIN_STORE;
		await adminStore.insertUser({ email, fullName: name, plaintextPassword: password, emailVerifiedAt: null, friendlyName: name, imageUrl: null });
		return ctx.json({ success: true });
	}
);
