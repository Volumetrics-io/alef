import { Email } from '@a-type/auth';
import { SesEmailProvider } from '@a-type/auth-email-ses';
import { assert } from '@a-type/utils';
import { Context } from 'hono';
import { Env } from '../config/ctx.js';

export const email = new Email<Context<Env>>({
	provider: new SesEmailProvider({
		async getConnectionInfo(ctx) {
			assert(ctx.env.AWS_ACCESS_KEY_ID, 'AWS_ACCESS_KEY_ID is required');
			assert(ctx.env.AWS_SECRET_ACCESS_KEY, 'AWS_SECRET_ACCESS_KEY is required');
			assert(ctx.env.AWS_REGION, 'AWS_REGION is required');
			return {
				accessKeyId: ctx.env.AWS_ACCESS_KEY_ID,
				secretAccessKey: ctx.env.AWS_SECRET_ACCESS_KEY,
				region: ctx.env.AWS_REGION,
			};
		},
	}),
	async getConfig(ctx) {
		assert(ctx.env.EMAIL_FROM, 'EMAIL_FROM is required');
		assert(ctx.env.UI_ORIGIN, 'UI_ORIGIN is required');
		return {
			from: ctx.env.EMAIL_FROM,
			uiOrigin: ctx.env.UI_ORIGIN,
			appName: 'Alef',
			developerName: 'The Alef Team',
		};
	},
});
