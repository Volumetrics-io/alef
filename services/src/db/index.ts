import { WorkerEntrypoint } from 'cloudflare:workers';
import { Env } from './env.js';

export { AdminStore } from './adminStore.js';
export { AuthedStore } from './authedStore.js';
export { PublicStore } from './publicStore.js';

// default service API just provides a healthcheck for the database connection
export default class extends WorkerEntrypoint<Env> {
	async fetch() {
		const ok = await this.env.STORE.healthCheck();
		return new Response(ok ? 'OK' : 'NOT OK', {
			status: ok ? 200 : 500,
		});
	}
}
