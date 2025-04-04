import { id, PrefixedId } from '@alef/common';
import { RpcTarget } from 'cloudflare:workers';
import { DB, userNameSelector } from './kysely/index.js';
import { DeviceUpdate } from './kysely/tables.js';

export class AuthedStore extends RpcTarget {
	#userId: PrefixedId<'u'>;
	#db: DB;

	constructor(userId: PrefixedId<'u'>, db: DB) {
		super();
		this.#userId = userId;
		this.#db = db;
	}

	async getSession() {
		return this.#db.selectFrom('User').where('id', '=', this.#userId).select(['id', userNameSelector, 'isProductAdmin']).executeTakeFirst();
	}

	// returns more data than getSession
	async getMe() {
		return this.#db.selectFrom('User').where('id', '=', this.#userId).selectAll().select(userNameSelector).executeTakeFirst();
	}

	// any authorized user-scoped operations go here

	async getAccessibleDevices() {
		return this.#db
			.selectFrom('Device')
			.innerJoin('DeviceAccess', 'Device.id', 'DeviceAccess.deviceId')
			.where('DeviceAccess.userId', '=', this.#userId)
			.selectAll('Device')
			.execute();
	}

	async claimDevice(deviceId: PrefixedId<'d'>) {
		await this.#db.insertInto('DeviceAccess').values({ userId: this.#userId, deviceId }).execute();
	}

	async deleteDevice(deviceId: PrefixedId<'d'>) {
		const deviceAccess = await this.#db.selectFrom('DeviceAccess').where('userId', '=', this.#userId).where('deviceId', '=', deviceId).selectAll().executeTakeFirst();

		if (!deviceAccess) {
			return;
		}

		// cascade will also delete access row
		await this.#db.deleteFrom('Device').where('id', '=', deviceId).execute();
	}

	updateDevice(deviceId: PrefixedId<'d'>, updates: Pick<DeviceUpdate, 'displayMode' | 'name' | 'type'>) {
		return this.#db.updateTable('Device').set(updates).where('id', '=', deviceId).returningAll().executeTakeFirst();
	}

	async getDevice(deviceId: PrefixedId<'d'>) {
		return this.#db
			.selectFrom('Device')
			.innerJoin('DeviceAccess', 'Device.id', 'DeviceAccess.deviceId')
			.where('DeviceAccess.userId', '=', this.#userId)
			.where('id', '=', deviceId)
			.selectAll('Device')
			.executeTakeFirst();
	}

	async getAllProperties() {
		return this.#db.selectFrom('Property').where('Property.ownerId', '=', this.#userId).selectAll().execute();
	}

	async insertProperty(name: string) {
		return this.#db
			.insertInto('Property')
			.values({ ownerId: this.#userId, id: id('p'), name })
			.returningAll()
			.executeTakeFirstOrThrow();
	}

	async getProperty(propertyId: PrefixedId<'p'>) {
		return this.#db.selectFrom('Property').where('id', '=', propertyId).selectAll().executeTakeFirst();
	}

	async upsertDefaultPublicAccessToken() {
		const token = crypto.randomUUID();
		const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days

		const existingToken = await this.#db
			.selectFrom('PublicAccessToken')
			.where('userId', '=', this.#userId)
			.where('name', '=', 'DEFAULT')
			.select(['id', 'token', 'expiresAt'])
			.executeTakeFirst();

		// if existing token hasn't expired, return it
		if (existingToken) {
			if (new Date(existingToken.expiresAt) > new Date()) {
				return existingToken;
			} else {
				// if it has expired, delete it. new one will be created.
				await this.#db.deleteFrom('PublicAccessToken').where('id', '=', existingToken.id).execute();
			}
		}

		return this.#db
			.insertInto('PublicAccessToken')
			.values({ id: id('pat'), token, expiresAt, userId: this.#userId, name: 'DEFAULT' })
			.returning(['id', 'token', 'expiresAt'])
			.executeTakeFirstOrThrow();
	}
}
