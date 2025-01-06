import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { requestId } from 'hono/request-id';
import { handleError } from '../../common/middleware/errors.js';
import { sessionMiddleware } from '../../common/middleware/session.js';
import { Env } from './config/ctx.js';
import { authRouter } from './routers/auth.js';

const app = new Hono<Env>()
	.onError(handleError)
	.use(requestId())
	.use(
		cors({
			origin: (origin, ctx) => {
				if (origin === ctx.env.UI_ORIGIN) {
					return origin;
				}
				return null;
			},
			credentials: true,
			allowHeaders: ['Authorization', 'Content-Type', 'X-Request-Id', 'X-Csrf-Token'],
			exposeHeaders: ['Content-Type', 'Content-Length', 'X-Request-Id', 'Set-Cookie', 'X-Long-Game-Error', 'X-Long-Game-Message', 'X-Csrf-Token'],
		})
	)
	.use(logger())
	.use(sessionMiddleware)
	.get('/', (ctx) => ctx.text('Hello, world!'))
	.route('/auth', authRouter);

export default app;

export type AppType = typeof app;
