import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { requestId } from 'hono/request-id';
import { handleError } from '../middleware/errors.js';
import { sessionMiddleware } from '../middleware/session.js';
import { Env } from './config/ctx.js';
import { authRouter } from './routers/auth.js';
import { usersRouter } from './routers/users.js';

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
			exposeHeaders: ['Content-Type', 'Content-Length', 'X-Request-Id', 'Set-Cookie', 'X-Alef-Error', 'X-Alef-Message', 'X-Csrf-Token'],
		})
	)
	.use(logger())
	.use(sessionMiddleware)
	.get('/', (ctx) => ctx.text('Hello, world!'))
	.route('/auth', authRouter)
	.route('/users', usersRouter);

export default app;

export type AppType = typeof app;
