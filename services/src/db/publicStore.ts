import { AlefError, assertAttributeKey, assertPrefixedId, Attribute, FurnitureModelQuality, getFurnitureModelPath, getFurniturePreviewImagePath, PrefixedId } from '@alef/common';
import { WorkerEntrypoint } from 'cloudflare:workers';
import { ExpressionBuilder } from 'kysely';
import { jsonArrayFrom } from 'kysely/helpers/sqlite';
import { AuthedStore } from './authedStore.js';
import { Env } from './env.js';
import { DB, getDatabase } from './kysely/index.js';
import { Database, NewDevice } from './kysely/tables.js';

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
		return this.#db
			.selectFrom('Furniture')
			.where('id', '=', id)
			.select((eb) => ['id', 'name', 'modelUpdatedAt', this.selectFurnitureAttributes(eb)])
			.executeTakeFirst();
	}

	async getFurnitureModelResponse(id: PrefixedId<'f'>, quality = FurnitureModelQuality.Original) {
		const object = await this.env.FURNITURE_MODELS_BUCKET.get(getFurnitureModelPath(id, quality));
		if (!object) {
			return new AlefError(AlefError.Code.NotFound, 'Model not found').toResponse();
		}
		const headers = new Headers();
		object.writeHttpMetadata(headers);
		headers.set('etag', object.httpEtag);
		return new Response(object.body, { headers });
	}

	async getFurnitureImageResponse(id: PrefixedId<'f'>) {
		const object = await this.env.FURNITURE_MODELS_BUCKET.get(getFurniturePreviewImagePath(id));
		if (!object) {
			return new AlefError(AlefError.Code.NotFound, 'Image not found').toResponse();
		}
		const headers = new Headers();
		object.writeHttpMetadata(headers);
		headers.set('etag', object.httpEtag);
		return new Response(object.body, { headers });
	}

	private selectFurnitureAttributes(eb: ExpressionBuilder<Database, 'Furniture'>) {
		return jsonArrayFrom(
			eb
				.selectFrom('FurnitureAttribute')
				.innerJoin('Attribute', 'FurnitureAttribute.attributeId', 'Attribute.id')
				.whereRef('FurnitureAttribute.furnitureId', '=', 'Furniture.id')
				.select(['Attribute.key', 'Attribute.value'])
		).as('attributes');
	}

	async listFurniture() {
		return this.#db
			.selectFrom('Furniture')
			.select((eb) => ['id', 'name', 'modelUpdatedAt', this.selectFurnitureAttributes(eb)])
			.execute();
	}

	async getAttributeValues(key: string) {
		assertAttributeKey(key);
		return this.#db.selectFrom('Attribute').where('key', '=', key).select(['key', 'value']).execute();
	}

	async listAttributes() {
		return this.#db.selectFrom('Attribute').select(['key', 'value']).execute();
	}

	async listFurnitureByAttributes(attributes: Attribute[]) {
		// Start with the base query
		let builder = this.#db
			.selectFrom('Furniture')
			.distinct();

		// Separate attributes by key
		const categorizedAttributes = attributes.reduce<Record<string, Attribute[]>>((acc, attr) => {
			assertAttributeKey(attr.key);
			if (!acc[attr.key]) {
				acc[attr.key] = [];
			}
			acc[attr.key].push(attr);
			return acc;
		}, {});

		// First, handle categories with OR logic (if any)
		if (categorizedAttributes['category'] && categorizedAttributes['category'].length > 0) {
			const categoryAttributes = categorizedAttributes['category'];
			console.log('Processing categories:', categoryAttributes);
			
			// Add a condition that matches any of the categories
			builder = builder.where(eb => {
				// Create an OR condition for all categories
				return eb.or(
					categoryAttributes.map(({ key, value }) => {
						return eb.exists(
							eb.selectFrom('FurnitureAttribute')
								.innerJoin('Attribute', 'FurnitureAttribute.attributeId', 'Attribute.id')
								.whereRef('FurnitureAttribute.furnitureId', '=', 'Furniture.id')
								.where('Attribute.key', '=', key)
								.where('Attribute.value', '=', value)
								.select('FurnitureAttribute.furnitureId')
						);
					})
				);
			});
		}

		// Then, handle all other attribute types with AND logic
		Object.entries(categorizedAttributes).forEach(([key, attrs]) => {
			// Skip categories as they've already been handled
			if (key === 'category') return;
			if (attrs.some(({ key, value }) => key === 'type' && value === 'all')) return;
						
			// For each attribute of this type, add an EXISTS condition
			attrs.forEach(({ key, value }) => {
				builder = builder.where(eb => 
					eb.exists(
						eb.selectFrom('FurnitureAttribute')
							.innerJoin('Attribute', 'FurnitureAttribute.attributeId', 'Attribute.id')
							.whereRef('FurnitureAttribute.furnitureId', '=', 'Furniture.id')
							.where('Attribute.key', '=', key)
							.where('Attribute.value', '=', value)
							.select('FurnitureAttribute.furnitureId')
					)
				);
			});
		});

		return builder.select((eb) => ['Furniture.id', 'Furniture.name', 'Furniture.modelUpdatedAt', this.selectFurnitureAttributes(eb)]).execute();
	}

	/**
	 * Anonymous insertion of device info is allowed, as devices themselves are not
	 * authenticated at the time of discovery.
	 *
	 * TODO: once discovered and claimed, devices can only be modified by their owners
	 */
	async ensureDeviceExists(info: Omit<NewDevice, 'displayMode' | 'name'> & { name?: string }, owner?: PrefixedId<'u'>) {
		await this.#db
			.insertInto('Device')
			.values({
				// provide a default name if none was provided
				name: 'Unnamed Device',
				id: info.id,
				// devices always start in staging mode
				displayMode: 'staging',
			})
			// if device already exists, keep existing values.
			.onConflict((cb) => cb.column('id').doNothing())
			.execute();

		if (owner) {
			console.log('claiming device', info.id, 'for user', owner);
			await this.#db
				.insertInto('DeviceAccess')
				.values({ userId: owner, deviceId: info.id })
				.onConflict((cb) => cb.columns(['userId', 'deviceId']).doNothing())
				.execute();
		}

		// fetch device via query; upserts cannot return the full row if a conflict occurs.
		const device = await this.#db.selectFrom('Device').select(['id', 'name']).where('id', '=', info.id).executeTakeFirstOrThrow();

		return device;
	}

	async getDeviceAccess(deviceId: PrefixedId<'d'>) {
		return this.#db.selectFrom('DeviceAccess').where('deviceId', '=', deviceId).select('userId').execute();
	}

	async getDevice(deviceId: PrefixedId<'d'>) {
		return this.#db
			.selectFrom('Device')
			.where('id', '=', deviceId)
			.select([
				// allow access to limited public info.
				'Device.id',
				'Device.createdAt',
				'Device.updatedAt',
			])
			.executeTakeFirst();
	}
}
