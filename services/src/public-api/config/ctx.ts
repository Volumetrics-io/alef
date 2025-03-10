import type { AdminStore, PublicStore } from '../../db/index.js';
import { SessionWithPrefixedIds } from '../../middleware/session.js';
import { DeviceDiscovery } from '../durableObjects/DeviceDiscovery.js';
import { Property } from '../durableObjects/Property.js';

export interface Bindings {
	// env
	GOOGLE_AUTH_CLIENT_ID: string;
	GOOGLE_AUTH_CLIENT_SECRET: string;
	UI_ORIGIN: string;
	API_ORIGIN: string;
	AWS_ACCESS_KEY_ID: string;
	AWS_SECRET_ACCESS_KEY: string;
	AWS_REGION: string;
	EMAIL_FROM: string;
	NODE_ENV: string;
	SESSION_SECRET: string;
	ADMIN_UI_ORIGIN: string;
	DEVICE_ID_SIGNING_SECRET: string;
	SOCKET_TOKEN_SECRET: string;
	EXTRA_CORS_ORIGINS?: string;
	TOKEN_ISSUER_OVERRIDE?: string;
	TOKEN_AUDIENCE_OVERRIDE?: string;

	// services
	// TODO: use Service<T> wrapper, but this breaks Hono RPC client types
	// ref: https://github.com/honojs/hono/issues/3811
	PUBLIC_STORE: Service<PublicStore>;
	ADMIN_STORE: Service<AdminStore>;
	DEVICE_DISCOVERY: DurableObjectNamespace<DeviceDiscovery>;
	PROPERTY: DurableObjectNamespace<Property>;
}

export interface CtxVars {
	session?: SessionWithPrefixedIds;
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
