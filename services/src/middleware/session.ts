import { Session } from '@a-type/auth';
import { AlefError, assertPrefixedId, PrefixedId } from '@alef/common';
import { RpcStub } from 'cloudflare:workers';
import { Context } from 'hono';
import { createMiddleware } from 'hono/factory';
import type { AuthedStore } from '../db/index.js';
import { sessions } from '../public-api/auth/session.js';
import { Env } from '../public-api/config/ctx.js';

export type SessionWithPrefixedIds = Omit<Session, 'userId'> & {
	userId: PrefixedId<'u'>;
};

async function getRequestSessionOrThrow(ctx: Context): Promise<SessionWithPrefixedIds> {
	const session = await sessions.getSession(ctx);

	if (!session) {
		throw new AlefError(AlefError.Code.Unauthorized, 'You must be logged in to access this functionality.');
	}

	const userId = session.userId;
	assertPrefixedId(userId, 'u');
	return {
		...session,
		userId,
	};
}

export const loggedInMiddleware = createMiddleware<{
	Variables: {
		session: SessionWithPrefixedIds;
	};
	Bindings: Env['Bindings'];
}>(async (ctx, next) => {
	const session = await getRequestSessionOrThrow(ctx);
	ctx.set('session', session);
	return next();
});

export const userStoreMiddleware = createMiddleware<{
	Variables: {
		userStore: RpcStub<AuthedStore>;
		session: SessionWithPrefixedIds;
	};
	Bindings: Env['Bindings'];
}>(async (ctx, next) => {
	const session = await getRequestSessionOrThrow(ctx);
	ctx.set('session', session);
	const userStore = await ctx.env.PUBLIC_STORE.getStoreForUser(session.userId);
	ctx.set('userStore', userStore);
	return next();
});

export const writeAccessMiddleware = createMiddleware<{
	Variables: {
		userStore: RpcStub<AuthedStore>;
		session: SessionWithPrefixedIds;
	};
	Bindings: Env['Bindings'];
}>(async (ctx, next) => {
	const session = await getRequestSessionOrThrow(ctx);
	ctx.set('session', session);
	const userStore = await ctx.env.PUBLIC_STORE.getStoreForUser(session.userId);
	ctx.set('userStore', userStore);
	if (session.access && session.access !== 'write:all') {
		throw new AlefError(AlefError.Code.Unauthorized, 'You do not have write access to this resource.');
	}
	return next();
});

/**
 * Only useful for endpoints that may be public or private.
 * Other middleware exported from this module is more convenient
 * by ensuring logged in status and/or providing userStore.
 */
export const sessionMiddleware = createMiddleware<{
	Variables: Env['Variables'] & {
		session: SessionWithPrefixedIds | null;
	};
	Bindings: Env['Bindings'];
}>(async (ctx, next) => {
	let session: SessionWithPrefixedIds | null = null;
	try {
		session = await getRequestSessionOrThrow(ctx);
	} catch (err) {
		if (err instanceof AlefError) {
			if (err.code === AlefError.Code.Unauthorized) {
				return next();
			}
		}
		throw err;
	}
	ctx.set('session', session);
	return next();
});
