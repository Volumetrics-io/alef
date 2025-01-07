import { PrefixedId, assertAttributeKey, assertPrefixedId, attributeKeys } from '@alef/common';
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

	async getFurniture(id: PrefixedId<'f'>) {
		assertPrefixedId(id, 'f');
		return this.#db.selectFrom('Furniture').where('id', '=', id).selectAll().executeTakeFirst();
	}

	async listFurniture() {
		return this.#db.selectFrom('Furniture').selectAll().execute();
	}

	async getAttributeKeys() {
		return attributeKeys;
	}

	async getAttributeValues(key: string) {
		assertAttributeKey(key);
		return this.#db.selectFrom('Attribute').where('key', '=', key).select('value').execute();
	}

	async listFurnitureByAttributes(attributes: Record<string, string>) {
		let builder = this.#db
			.selectFrom('FurnitureAttribute')
			.leftJoin('Attribute', 'FurnitureAttribute.attributeId', 'Attribute.id')
			.leftJoin('Furniture', 'FurnitureAttribute.furnitureId', 'Furniture.id');
		for (const [key, value] of Object.entries(attributes)) {
			assertAttributeKey(key);
			builder = builder.where('key', '=', key).where('value', '=', value);
		}
		return builder.selectAll('Furniture').execute();
	}
}
