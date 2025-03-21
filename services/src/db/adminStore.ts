import { AuthAccount, AuthUser, AuthVerificationCode } from '@a-type/auth';
import { FurnitureModelQuality, PrefixedId, assertAttributeKey, assertPrefixedId, getFurnitureModelPath, getFurniturePreviewImagePath, id } from '@alef/common';
import { WorkerEntrypoint } from 'cloudflare:workers';
import { Env } from './env.js';
import { DB, comparePassword, getDatabase, hashPassword } from './kysely/index.js';
import { FurnitureUpdate } from './kysely/tables.js';

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

	async consumeVerificationCode(email: string, code: string) {
		await this.#db.deleteFrom('VerificationCode').where('code', '=', code).where('email', '=', email).execute();
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

	async insertFurniture(data: { name: string; attributes?: { key: string; value: string }[]; originalFileName?: string }) {
		const furnitureId = id('f');
		await this.#db
			.insertInto('Furniture')
			.values({
				id: furnitureId,
				name: data.name,
				originalFileName: data.originalFileName || null,
			})
			.executeTakeFirstOrThrow();

		if (data.attributes) {
			for (const { key, value } of data.attributes) {
				await this.addFurnitureAttribute(furnitureId, key, value);
			}
		}

		return { id: furnitureId };
	}

	async updateFurniture(id: string, data: Pick<FurnitureUpdate, 'name' | 'measuredDimensionsX' | 'measuredDimensionsY' | 'measuredDimensionsZ' | 'madePublicAt'>) {
		assertPrefixedId(id, 'f');
		await this.#db.updateTable('Furniture').set(data).where('id', '=', id).execute();
	}

	async uploadFurnitureModel(
		id: string,
		modelStream: ReadableStream,
		quality: FurnitureModelQuality = FurnitureModelQuality.Original,
		dimensions?: { x: number; y: number; z: number } | null
	) {
		assertPrefixedId(id, 'f');
		await this.env.FURNITURE_MODELS_BUCKET.put(getFurnitureModelPath(id, quality), modelStream);
		await this.#db
			.updateTable('Furniture')
			.set({
				modelUpdatedAt: new Date(),
				measuredDimensionsX: dimensions?.x || null,
				measuredDimensionsY: dimensions?.y || null,
				measuredDimensionsZ: dimensions?.z || null,
			})
			.where('id', '=', id)
			.execute();
	}

	async uploadFurnitureImage(id: string, imageStream: ReadableStream) {
		assertPrefixedId(id, 'f');
		await this.env.FURNITURE_MODELS_BUCKET.put(getFurniturePreviewImagePath(id), imageStream);
		await this.#db.updateTable('Furniture').set({ screenshotUpdatedAt: new Date() }).where('id', '=', id).execute();
	}

	async deleteFurniture(id: string) {
		assertPrefixedId(id, 'f');
		await this.#db.deleteFrom('Furniture').where('id', '=', id).execute();
		await this.env.FURNITURE_MODELS_BUCKET.delete(id);
	}

	async addFurnitureAttribute(furnitureId: string, key: string, value: string) {
		assertPrefixedId(furnitureId, 'f');
		assertAttributeKey(key);
		await this.#db
			.insertInto('Attribute')
			.values({
				id: id('at'),
				key,
				value,
			})
			.onConflict((cb) => cb.columns(['key', 'value']).doNothing())
			.execute();
		// select must be separate as a "do nothing" conflict returns no result rows.
		const { id: attributeId } = await this.#db.selectFrom('Attribute').where('key', '=', key).where('value', '=', value).select('id').executeTakeFirstOrThrow();
		await this.#db
			.insertInto('FurnitureAttribute')
			.values({
				furnitureId,
				attributeId,
			})
			.onConflict((cb) => cb.columns(['furnitureId', 'attributeId']).doNothing())
			.execute();
	}

	async deleteFurnitureAttribute(furnitureId: string, key: string, value: string) {
		assertPrefixedId(furnitureId, 'f');
		assertAttributeKey(key);
		const attr = await this.#db.selectFrom('Attribute').where('key', '=', key).where('value', '=', value).select('id').executeTakeFirst();
		if (!attr) {
			// that's fine, nothing to do
			return;
		}
		const attributeId = attr.id;
		await this.#db.deleteFrom('FurnitureAttribute').where('furnitureId', '=', furnitureId).where('attributeId', '=', attributeId).execute();
	}

	/**
	 * Lists all furniture in need of further processing,
	 * like taking a screenshot or measuring dimensions
	 */
	async listUnprocessedFurniture() {
		const query = this.#db
			.selectFrom('Furniture')
			.where((eb) =>
				eb.or([eb('screenshotUpdatedAt', 'is', null), eb('measuredDimensionsX', 'is', null), eb('measuredDimensionsY', 'is', null), eb('measuredDimensionsZ', 'is', null)])
			)
			.select(['id', 'screenshotUpdatedAt', 'measuredDimensionsX', 'measuredDimensionsY', 'measuredDimensionsZ']);
		return query.execute();
	}

	async deleteDevice(id: PrefixedId<'d'>) {
		await this.#db.deleteFrom('Device').where('id', '=', id).execute();
	}

	async deleteUnusedAttributeValues() {
		const res = await this.#db
			.deleteFrom('Attribute')
			.where('id', 'not in', (eb) => eb.selectFrom('FurnitureAttribute').select('attributeId').distinct())
			.execute();

		return res.length;
	}
}
