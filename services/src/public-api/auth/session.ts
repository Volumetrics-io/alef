import { honoAdapter, SessionManager } from '@a-type/auth';
import { AlefError, assertPrefixedId, PrefixedId } from '@alef/common';
import { Context } from 'hono';
import { Env } from '../config/ctx.js';
import { getDeviceId } from './devices.js';
import { getRootDomain } from './domains.js';

declare module '@a-type/auth' {
	interface Session {
		userId: string;
		name: string | null;
		isProductAdmin: boolean;
		deviceId?: PrefixedId<'d'>;
		access?: 'write:all' | 'read:all';
	}
}

export const sessions = new SessionManager<Context<Env>>({
	getSessionConfig(ctx) {
		const apiUrl = new URL(ctx.env.API_ORIGIN);
		// adapt refresh cookie path to any base path on API origin
		const refreshPath = apiUrl.pathname.replace(/\/$/, '') + '/auth/refresh';
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

				const deviceId = (await getDeviceId(ctx)) || undefined;

				return {
					userId,
					name: user.name,
					isProductAdmin: user.isProductAdmin,
					deviceId,
					// users who log in via sign-in have write access.
					access: 'write:all',
				};
			},
			secret: ctx.env.SESSION_SECRET,
			audience: ctx.env.TOKEN_AUDIENCE_OVERRIDE ?? ctx.env.UI_ORIGIN,
			issuer: ctx.env.TOKEN_ISSUER_OVERRIDE ?? ctx.env.API_ORIGIN,
			mode: 'production',
			refreshPath,
			refreshTokenCookieName: 'alef-refresh',
		};
	},
	shortNames: {
		userId: 'sub',
		name: 'name',
		isProductAdmin: 'pad',
		deviceId: 'dev',
		access: 'acc',
	},
	adapter: honoAdapter,
});
