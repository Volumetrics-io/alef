import { honoAdapter, SessionManager } from '@a-type/auth';
import { AlefError, assertPrefixedId } from '@alef/common';
import { Context } from 'hono';
import { Env } from '../config/ctx.js';
import { getRootDomain } from './domains.js';

declare module '@a-type/auth' {
	interface Session {
		userId: string;
		name: string | null;
		isProductAdmin: boolean;
	}
}

export const sessions = new SessionManager<Context<Env>>({
	getSessionConfig(ctx) {
		return {
			cookieName: 'alef-session',
			cookieOptions: {
				sameSite: 'lax',
				domain: getRootDomain(ctx.env.API_ORIGIN),
			},
			expiration: ctx.env.NODE_ENV === 'production' ? '1d' : '1m',
			async createSession(userId) {
				assertPrefixedId(userId, 'u');
				const user = await (await ctx.env.PUBLIC_STORE.getStoreForUser(userId)).getSession();

				if (!user) {
					throw new AlefError(AlefError.Code.BadRequest, `Invalid session. User with ID ${userId} not found.`);
				}

				return {
					userId,
					name: user.name,
					isProductAdmin: user.isProductAdmin,
				};
			},
			secret: ctx.env.SESSION_SECRET,
			audience: ctx.env.UI_ORIGIN,
			issuer: ctx.env.API_ORIGIN,
			mode: 'production',
			refreshPath: '/auth/refresh',
			refreshTokenCookieName: 'alef-refresh',
		};
	},
	shortNames: {
		userId: 'sub',
		name: 'name',
		isProductAdmin: 'pad',
	},
	adapter: honoAdapter,
});
