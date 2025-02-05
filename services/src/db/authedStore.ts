import { PrefixedId } from '@alef/common';
import { RpcTarget } from 'cloudflare:workers';
import { DB, userNameSelector } from './kysely/index.js';

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
}
