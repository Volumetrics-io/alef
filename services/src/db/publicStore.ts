import {
	AlefError,
	assertAttributeKey,
	assertPrefixedId,
	Attribute,
	DeviceType,
	FurnitureModelQuality,
	getFurnitureModelPath,
	getFurniturePreviewImagePath,
	PrefixedId,
} from '@alef/common';
import { WorkerEntrypoint } from 'cloudflare:workers';
import { ExpressionBuilder } from 'kysely';
import { jsonArrayFrom } from 'kysely/helpers/sqlite';
import { AuthedStore } from './authedStore.js';
import { Env } from './env.js';
import { DB, getDatabase } from './kysely/index.js';
import { Database, DeviceUpdate, NewDevice } from './kysely/tables.js';

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
	async getFurniture(
		id: PrefixedId<'f'>,
		{
			includeNonPublic,
		}: {
			includeNonPublic?: boolean;
		} = {}
	) {
		assertPrefixedId(id, 'f');
		let builder = this.#db
			.selectFrom('Furniture')
			.where('id', '=', id)
			.select((eb) => ['id', 'name', 'modelUpdatedAt', 'measuredDimensionsX', 'measuredDimensionsY', 'measuredDimensionsZ', 'madePublicAt', this.selectFurnitureAttributes(eb)]);
		if (!includeNonPublic) {
			builder = builder.where('madePublicAt', 'is not', null);
		}

		return builder.executeTakeFirst();
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

	async listFurniture({ attributeFilters, page, pageSize, includeNonPublic }: { attributeFilters?: Attribute[]; page?: number; pageSize?: number; includeNonPublic?: boolean }) {
		let builder = this.#db
			.selectFrom('Furniture')
			.select((eb) => [
				'Furniture.id',
				'Furniture.name',
				'Furniture.modelUpdatedAt',
				'Furniture.measuredDimensionsX',
				'Furniture.measuredDimensionsY',
				'Furniture.measuredDimensionsZ',
				'Furniture.madePublicAt',
				this.selectFurnitureAttributes(eb),
			]);

		if (!includeNonPublic) {
			builder = builder.where('Furniture.madePublicAt', 'is not', null);
		}

		if (attributeFilters) {
			// Separate attributes by key
			const categorizedAttributes = attributeFilters.reduce<Record<string, Attribute[]>>((acc, attr) => {
				assertAttributeKey(attr.key);
				if (!acc[attr.key]) {
					acc[attr.key] = [];
				}
				acc[attr.key].push(attr);
				return acc;
			}, {});

			// furniture must match attributes with the following rules:
			// when multiple attribute values with the same key are selected,
			//  the furniture must match any one of those values
			// when multiple attributes of DIFFERENT keys are selected,
			//  the furniture must match at least one value for each key.
			// e.g. if we have selected 'chair' and 'sofa' for 'type' and 'living room' for 'category',
			//  the furniture must be either a chair or a sofa and must be in the living room category.

			// this is expressed by filtering by attribute key where value is in the
			// set of values for that key. we can't select directly on Attribute, though,
			// we need to include the whole join in the clause, because there will
			// be multiple distinct attributes matched against when multiple keys
			// are provided.
			for (const [key, attrs] of Object.entries(categorizedAttributes)) {
				assertAttributeKey(key);
				builder = builder.where((eb) =>
					eb.exists(
						eb
							.selectFrom('FurnitureAttribute')
							.select('FurnitureAttribute.furnitureId')
							.innerJoin('Attribute', 'FurnitureAttribute.attributeId', 'Attribute.id')
							.whereRef('FurnitureAttribute.furnitureId', '=', 'Furniture.id')
							.where('Attribute.key', '=', key)
							.where(
								'Attribute.value',
								'in',
								attrs.map((attr) => attr.value)
							)
					)
				);
			}
		}

		if (page !== undefined && pageSize !== undefined) {
			builder = builder.limit(pageSize + 1).offset(pageSize * page);
		}

		const result = await builder.execute();

		const hasNextPage = !!pageSize && result.length > pageSize;
		if (hasNextPage) {
			result.pop();
		}

		return { items: result, pageInfo: { hasNextPage, pageSize, page, nextPage: page === undefined ? undefined : page + 1 } };
	}

	async getAttributeValues(key: string) {
		assertAttributeKey(key);
		const rows = await this.#db.selectFrom('Attribute').where('key', '=', key).select(['value']).orderBy('value asc').execute();
		return rows.map((r) => r.value);
	}

	async listAttributes() {
		return this.#db.selectFrom('Attribute').select(['key', 'value']).execute();
	}

	/**
	 * Anonymous insertion of device info is allowed, as devices themselves are not
	 * authenticated at the time of discovery.
	 *
	 * TODO: once discovered and claimed, devices can only be modified by their owners
	 */
	async ensureDeviceExists(info: Omit<NewDevice, 'displayMode' | 'name' | 'type'> & { type?: DeviceType; name?: string; defaultName?: string }, owner?: PrefixedId<'u'>) {
		const conflictUpdates: DeviceUpdate = {};
		if (info.name) {
			// if a name is provided, we should update the name in case of conflicts.
			// this allows for devices to be renamed. otherwise we should not
			// include it.
			conflictUpdates.name = info.name;
		}
		if (info.type) {
			// if a type is provided, we should update the type in case of conflicts.
			// this allows for devices to change types if needed.
			conflictUpdates.type = info.type;
		}
		await this.#db
			.insertInto('Device')
			.values({
				// provide a default name if none was provided
				// devices always start in staging mode
				displayMode: 'staging',
				id: info.id,
				name: info.name ?? info.defaultName ?? `Unnamed ${info.type ?? 'device'}`,
				type: info.type ?? 'other',
			})
			// if device already exists, keep existing values.
			.onConflict((cb) => cb.column('id').doUpdateSet(conflictUpdates))
			.execute();

		if (owner) {
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

	async getPublicAccessToken(token: string) {
		console.log('getting token', token);
		const publicAccessToken = await this.#db.selectFrom('PublicAccessToken').where('token', '=', token).selectAll().executeTakeFirst();

		if (!publicAccessToken) {
			return null;
		}

		if (new Date(publicAccessToken.expiresAt) < new Date()) {
			return null;
		}

		return publicAccessToken;
	}
}
