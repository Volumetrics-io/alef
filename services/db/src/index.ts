import { AuthAccount, AuthUser, AuthVerificationCode } from '@a-type/auth';
import { DB, PrefixedId, assertPrefixedId, comparePassword, getDatabase, hashPassword, id, userNameSelector } from '@alef/db';
import { RpcTarget, WorkerEntrypoint } from 'cloudflare:workers';

interface Env {
	D1: D1Database;
	STORE: Service<AdminStore>;
}

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

export class PublicStore extends WorkerEntrypoint<Env> {
	#db: DB;

	constructor(ctx: ExecutionContext, env: Env) {
		super(ctx, env);
		this.#db = getDatabase({ DB: env.D1 });
	}

	async getStoreForUser(userId: PrefixedId<'u'>) {
		return new AuthedStore(userId, this.#db);
	}
}

export class AdminStore extends WorkerEntrypoint<Env> {
	#db: DB;

	constructor(ctx: ExecutionContext, env: Env) {
		super(ctx, env);
		this.#db = getDatabase({ DB: env.D1 });
	}

	async healthCheck() {
		const result = await this.env.D1.prepare('SELECT 1 AS alive;').first<number>('alive');
		return result === 1;
	}

	async getAccountByProviderAccountId(providerName: string, providerAccountId: string) {
		const dbAccount = await this.#db.selectFrom('Account').where('provider', '=', providerName).where('providerAccountId', '=', providerAccountId).selectAll().executeTakeFirst();

		if (!dbAccount) {
			return undefined;
		}

		return {
			...dbAccount,
			expiresAt: dbAccount.accessTokenExpiresAt ?? null,
		};
	}

	async getUserByEmail(email: string) {
		return this.#db.selectFrom('User').where('email', '=', email).selectAll().executeTakeFirst();
	}

	async insertAccount({ expiresAt, userId, ...account }: Omit<AuthAccount, 'id'>) {
		return this.#db
			.insertInto('Account')
			.values({
				id: id('a'),
				accessTokenExpiresAt: expiresAt ? new Date(expiresAt) : undefined,
				userId: userId as PrefixedId<'u'>,
				...account,
			})
			.returning('id')
			.executeTakeFirstOrThrow();
	}

	async insertUser({
		plaintextPassword,
		fullName,
		friendlyName,
		...user
	}: Omit<AuthUser, 'id' | 'password'> & {
		plaintextPassword?: string | null;
	}) {
		const password = plaintextPassword ? await hashPassword(plaintextPassword) : undefined;
		const userResult = await this.#db
			.insertInto('User')
			.values({
				id: id('u'),
				password,
				fullName: fullName || 'Anonymous',
				friendlyName: friendlyName || 'Anonymous',
				...user,
			})
			.returning('id')
			.executeTakeFirst();

		if (!userResult) {
			throw new Error('Failed to insert user');
		}

		return userResult;
	}

	async insertVerificationCode({ expiresAt, ...verificationCode }: Omit<AuthVerificationCode, 'id'>) {
		await this.#db
			.insertInto('VerificationCode')
			.values({
				id: id('vc'),
				expiresAt: new Date(expiresAt),
				...verificationCode,
			})
			.execute();
	}

	async getVerificationCode(email: string, code: string) {
		return this.#db.selectFrom('VerificationCode').where('code', '=', code).where('email', '=', email).selectAll().executeTakeFirst();
	}

	async consumeVerificationCode(id: string) {
		assertPrefixedId(id, 'vc');
		await this.#db.deleteFrom('VerificationCode').where('id', '=', id).execute();
	}

	async getUserByEmailAndPassword(email: string, plaintextPassword: string) {
		const user = await this.#db.selectFrom('User').where('email', '=', email).selectAll().executeTakeFirst();

		if (!user?.password) {
			return undefined;
		}

		if (!(await comparePassword(plaintextPassword, user.password))) {
			return undefined;
		}

		return user;
	}

	async updateUser(
		id: string,
		{
			plaintextPassword,
			...user
		}: Partial<Omit<AuthUser, 'id' | 'password' | 'email'>> & {
			plaintextPassword?: string | null;
		}
	) {
		assertPrefixedId(id, 'u');
		const password = plaintextPassword ? await hashPassword(plaintextPassword) : undefined;
		await this.#db
			.updateTable('User')
			.set({
				password,
				...user,
			})
			.where('id', '=', id)
			.execute();
	}
}

// default service API just provides a healthcheck for the database connection
export default class extends WorkerEntrypoint<Env> {
	async fetch() {
		const ok = await this.env.STORE.healthCheck();
		return new Response(ok ? 'OK' : 'NOT OK', {
			status: ok ? 200 : 500,
		});
	}
}
