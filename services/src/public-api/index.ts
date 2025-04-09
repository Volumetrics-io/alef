import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { requestId } from 'hono/request-id';
import { handleError } from '../middleware/errors.js';
import { Env } from './config/ctx.js';
import { authRouter } from './routers/auth.js';
import { devicesRouter } from './routers/devices.js';
import { furnitureRouter } from './routers/furniture.js';
import { propertiesRouter } from './routers/properties.js';
import { publicAccessTokensRouter } from './routers/publicAccessTokens.js';
import { socketRouter } from './routers/sockets.js';
import { usersRouter } from './routers/users.js';

const app = new Hono<Env>()
	.onError(handleError)
	.use(requestId())
	.use(logger())
	// before CORS, we have the socket endpoint -- the CORS middleware messes
	// up the response handling.
	.route('/socket', socketRouter)
	.use(
		cors({
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
			exposeHeaders: ['Content-Type', 'Content-Length', 'X-Request-Id', 'Set-Cookie', 'X-Alef-Error', 'X-Alef-Message', 'X-Csrf-Token'],
		})
	)
	.get('/', (ctx) => ctx.text('Hello, world!'))
	.route('/users', usersRouter)
	.route('/furniture', furnitureRouter)
	.route('/devices', devicesRouter)
	.route('/properties', propertiesRouter)
	.route('/publicAccessTokens', publicAccessTokensRouter);

// no need to include these routes in typings
app.route('/auth', authRouter);

export default app;

export { DeviceDiscovery } from './durableObjects/DeviceDiscovery.js';
export { Paircodes } from './durableObjects/Paircodes.js';
export { Property } from './durableObjects/Property.js';
