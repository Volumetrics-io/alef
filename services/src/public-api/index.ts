import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { requestId } from 'hono/request-id';
import { corsWithSocket } from '../middleware/cors.js';
import { handleError } from '../middleware/errors.js';
import { Env } from './config/ctx.js';
import { aiRouter } from './routers/ai.js';
import { authRouter } from './routers/auth.js';
import { devicesRouter } from './routers/devices.js';
import { furnitureRouter } from './routers/furniture.js';
import { propertiesRouter } from './routers/properties.js';
import { socketRouter } from './routers/sockets.js';
import { usersRouter } from './routers/users.js';

const app = new Hono<Env>()
	.onError(handleError)
	.use(requestId())
	.use(logger())
	.use(corsWithSocket)
	.get('/', (ctx) => ctx.text('Hello, world!'))
	.route('/users', usersRouter)
	.route('/furniture', furnitureRouter)
	.route('/devices', devicesRouter)
	.route('/properties', propertiesRouter)
	.route('/socket', socketRouter)
	.route('/ai', aiRouter);
// no need to include these routes in typings
app.route('/auth', authRouter);

export default app;

export { LayoutAgent } from './agents/layout/LayoutAgent.js';
export { DeviceDiscovery } from './durableObjects/DeviceDiscovery.js';
export { Paircodes } from './durableObjects/Paircodes.js';
export { Property } from './durableObjects/Property.js';
