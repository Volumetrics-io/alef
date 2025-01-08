import type { AdminStore, PublicStore } from '../../db/index.js';
import { SessionWithPrefixedIds } from '../../middleware/session.js';

export interface Bindings {
	// env
	GOOGLE_AUTH_CLIENT_ID: string;
	GOOGLE_AUTH_CLIENT_SECRET: string;
	UI_ORIGIN: string;
	API_ORIGIN: string;
	EMAIL_USER: string;
	EMAIL_PASS: string;
	NODE_ENV: string;
	SESSION_SECRET: string;
	ADMIN_UI_ORIGIN: string;

	// services
	// TODO: use Service<T> wrapper, but this breaks Hono RPC client types
	// ref: https://github.com/honojs/hono/issues/3811
	PUBLIC_STORE: PublicStore;
	ADMIN_STORE: AdminStore;
}

export interface CtxVars {
	requestId: string;
	session: SessionWithPrefixedIds | null;
	gameSessionId: string;
}

export interface Env {
	Variables: CtxVars;
	Bindings: Bindings;
}

export type EnvWith<T extends keyof Env['Variables']> = Omit<Env, 'Variables'> & {
	Variables: {
		[K in T]: K extends T ? NonNullable<Env['Variables'][K]> : Env['Variables'][K];
	};
};
