import { TimestampsPlugin } from '@a-type/kysely';
import { Kysely } from 'kysely';
import { D1Dialect } from 'kysely-d1';
import { SerializePlugin } from 'kysely-plugin-serialize';
import { Database } from './tables.js';

export type DB = Kysely<Database>;

export function getDatabase(env: { DB: D1Database }): DB {
	if (!env.DB) {
		throw new Error('Missing DB');
	}
	return new Kysely<Database>({
		dialect: new D1Dialect({
			database: env.DB,
		}),
		plugins: [
			new TimestampsPlugin({
				ignoredTables: ['<d1_migrations>'],
			}),
			new SerializePlugin(),
		],
	});
}

export { compareDates, comparePassword, dateTime, hashPassword, sqliteNow } from '@a-type/kysely';
export * from './utils.js';
