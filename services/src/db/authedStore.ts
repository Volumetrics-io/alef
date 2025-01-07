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
		return this.#db.selectFrom('User').where('id', '=', this.#userId).select(['id', userNameSelector]).executeTakeFirst();
	}

	// any authorized user-scoped operations go here
}
