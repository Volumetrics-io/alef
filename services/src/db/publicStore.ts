import { PrefixedId, assertPrefixedId } from '@alef/common';
import { WorkerEntrypoint } from 'cloudflare:workers';
import { AuthedStore } from './authedStore.js';
import { Env } from './env.js';
import { DB, getDatabase } from './kysely/index.js';

export class PublicStore extends WorkerEntrypoint<Env> {
	#db: DB;

	constructor(ctx: ExecutionContext, env: Env) {
		super(ctx, env);
		this.#db = getDatabase({ DB: env.D1 });
	}

	async getStoreForUser(userId: PrefixedId<'u'>) {
		return new AuthedStore(userId, this.#db);
	}

	// Furniture APIs

	async getFurniture(id: string) {
		assertPrefixedId(id, 'f');
		return this.#db.selectFrom('Furniture').where('id', '=', id).selectAll().executeTakeFirst();
	}

	async listFurniture() {
		return this.#db.selectFrom('Furniture').selectAll().execute();
	}
}
