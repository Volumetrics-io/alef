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
		return this.#db.selectFrom('Property').where('id', '=', propertyId).where('Property.ownerId', '=', this.#userId).selectAll().executeTakeFirst();
	}

	async hasProperty(propertyId: PrefixedId<'p'>) {
		return this.#db.selectFrom('Property').where('id', '=', propertyId).where('Property.ownerId', '=', this.#userId).select('id').executeTakeFirst();
	}

	async getOrganizations() {
		return this.#db
			.selectFrom('Organization')
			.innerJoin('Membership', 'Organization.id', 'Membership.organizationId')
			.where('Membership.userId', '=', this.#userId)
			.selectAll('Organization')
			.execute();
	}

	async getOrganization(organizationId: PrefixedId<'or'>) {
		return this.#db
			.selectFrom('Organization')
			.innerJoin('Membership', 'Organization.id', 'Membership.organizationId')
			.where('Membership.userId', '=', this.#userId)
			.where('Organization.id', '=', organizationId)
			.selectAll('Organization')
			.executeTakeFirst();
	}

	async getOrganizationAdmins(organizationId: PrefixedId<'or'>) {
		if (!(await this.getOrganization(organizationId))) {
			// no access or not exist
			return [];
		}
		return this.#db
			.selectFrom('Membership')
			.innerJoin('User', 'Membership.userId', 'User.id')
			.where('Membership.organizationId', '=', organizationId)
			.where('Membership.role', '=', 'admin')
			.selectAll('User')
			.execute();
	}
}
