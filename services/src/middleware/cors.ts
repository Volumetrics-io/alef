import { cors } from 'hono/cors';
import { createMiddleware } from 'hono/factory';

/**
 * Hono built-in CORS middleware attempts to rewrite responses of
 * WebSocket connections, which is not allowed. This wrapper
 * detects socket upgrade requests and bypasses cors response changes.
 */

const baseCorsMiddleware = cors({
	origin: (origin, ctx) => {
		if (origin === ctx.env.UI_ORIGIN || origin === ctx.env.ADMIN_UI_ORIGIN || origin === ctx.env.HOMEPAGE_ORIGIN) {
			return origin;
		}
		if (ctx.env.EXTRA_CORS_ORIGINS) {
			const origins = ctx.env.EXTRA_CORS_ORIGINS.split(',');
			if (origins.includes(origin)) {
				return origin;
			}
		}
		return null;
	},
	credentials: true,
	allowHeaders: ['Authorization', 'Content-Type', 'X-Request-Id', 'X-Csrf-Token'],
	exposeHeaders: ['Content-Type', 'Content-Length', 'X-Request-Id', 'Set-Cookie', 'X-Alef-Error', 'X-Alef-Message', 'X-Csrf-Token', 'X-Auth-Error'],
});

export const corsWithSocket = createMiddleware((ctx, next) => {
	if (ctx.req.header('upgrade')?.toLowerCase() === 'websocket') {
		// don't apply cors to websocket upgrade requests
		return next();
	}
	return baseCorsMiddleware(ctx, next);
});
