import { createHandlers, GoogleProvider, honoAdapter } from '@a-type/auth';
import { Context } from 'hono';
import { Env } from '../config/ctx.js';
import { email } from '../services/email.js';
import { sessions } from './session.js';

export const authHandlers = createHandlers<Context<Env>>({
	sessions,
	adapter: honoAdapter,
	getRedirectConfig: (ctx) => ({
		defaultReturnToOrigin: ctx.env.UI_ORIGIN,
	}),
	providers: {
		google: new GoogleProvider({
			getConfig(ctx) {
				return {
					clientId: ctx.env.GOOGLE_AUTH_CLIENT_ID,
					clientSecret: ctx.env.GOOGLE_AUTH_CLIENT_SECRET,
					redirectUri: ctx.env.API_ORIGIN + '/auth/provider/google/callback',
				};
			},
		}),
	},
	addProvidersToExistingUsers: true,
	defaultReturnToPath: '/',
	email,
	getStorage: (ctx) => ({
		async getAccountByProviderAccountId(provider, providerAccountId) {
			const value = await ctx.env.ADMIN_STORE.getAccountByProviderAccountId(provider, providerAccountId);
			if (!value) return value;
			return {
				...value,
				expiresAt: value.expiresAt ? new Date(value.expiresAt) : null,
			};
		},
		async getUserByEmail(email) {
			const value = await ctx.env.ADMIN_STORE.getUserByEmail(email);
			if (!value) return value;
			return {
				...value,
				// weird shimming required for Dates...
				emailVerifiedAt: value.emailVerifiedAt ? new Date(value.emailVerifiedAt) : null,
			};
		},
		insertAccount(account) {
			return ctx.env.ADMIN_STORE.insertAccount(account);
		},
		insertUser(user) {
			return ctx.env.ADMIN_STORE.insertUser(user);
		},
		updateUser(userId, user) {
			return ctx.env.ADMIN_STORE.updateUser(userId, user);
		},
		consumeVerificationCode(email, code) {
			return ctx.env.ADMIN_STORE.consumeVerificationCode(email, code);
		},
		async getUserByEmailAndPassword(email, password) {
			const value = await ctx.env.ADMIN_STORE.getUserByEmailAndPassword(email, password);
			if (!value) return value;
			return {
				...value,
				emailVerifiedAt: value.emailVerifiedAt ? new Date(value.emailVerifiedAt) : null,
			};
		},
		insertVerificationCode(data) {
			return ctx.env.ADMIN_STORE.insertVerificationCode(data);
		},
		async getVerificationCode(email, code) {
			const value = await ctx.env.ADMIN_STORE.getVerificationCode(email, code);
			if (!value) return value;
			return {
				...value,
				expiresAt: new Date(value.expiresAt),
			};
		},
	}),
});
