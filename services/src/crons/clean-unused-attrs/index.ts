import type { AdminStore } from '../../db';

interface Env {
	ADMIN_STORE: Service<AdminStore>;
}

export default {
	async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
		const result = await env.ADMIN_STORE.deleteUnusedAttributeValues();
		console.log('Deleted unused attribute values', result);
	},
};
