import { PrefixedId, assertAttributeKey, assertPrefixedId, attributeKeys } from '@alef/common';
import { WorkerEntrypoint } from 'cloudflare:workers';
import { jsonArrayFrom } from 'kysely/helpers/sqlite';
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
		return this.#db
			.selectFrom('Furniture')
			.select((eb) => [
				'id',
				'name',
				jsonArrayFrom(
					eb
						.selectFrom('FurnitureAttribute')
						.leftJoin('Attribute', 'FurnitureAttribute.attributeId', 'Attribute.id')
						.whereRef('FurnitureAttribute.furnitureId', '=', 'Furniture.id')
						.select(['Attribute.key', 'Attribute.value'])
				).as('attributes'),
			])
			.execute();
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
			.selectFrom('Furniture')
			.leftJoin('FurnitureAttribute', 'FurnitureAttribute.furnitureId', 'Furniture.id')
			.leftJoin('Attribute', 'FurnitureAttribute.attributeId', 'Attribute.id');
		for (const [key, value] of Object.entries(attributes)) {
			assertAttributeKey(key);
			builder = builder.where('Attribute.key', '=', key).where('Attribute.value', '=', value);
		}
		return builder
			.select((eb) => [
				'Furniture.id',
				'Furniture.name',
				jsonArrayFrom(
					eb
						.selectFrom('FurnitureAttribute')
						.leftJoin('Attribute', 'FurnitureAttribute.attributeId', 'Attribute.id')
						.whereRef('FurnitureAttribute.furnitureId', '=', 'Furniture.id')
						.select(['Attribute.key', 'Attribute.value'])
				).as('attributes'),
			])
			.execute();
	}
}
