import { hashPassword } from '@a-type/kysely';
import { id } from '@alef/common';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const argv = process.argv.slice(2);

if (argv.length < 3) {
	console.error('Usage: createUser.mjs <email> <password> <name> (<admin>)');
	process.exit(1);
}

let [email, password, name, adminInput] = argv;

if (!email || !password) {
	console.error('Usage: createUser.mjs <email> <password> <name>');
	process.exit(1);
}

if (!name) {
	name = email.split('@')[0];
}

if (password.length < 4) {
	console.error('Password must be at least 4 characters');
	process.exit(1);
}

const hashedPassword = await hashPassword(password);
const isProductAdmin = adminInput === 'true' ? 1 : 0;

const sql = `insert into User (id, email, password, fullName, friendlyName, isProductAdmin)
	values ('${id('u')}', '${email}', '${hashedPassword}', '${name}', '${name}', ${isProductAdmin});`;
console.log('Running', sql);

spawnSync('pnpx', ['wrangler', 'd1', 'execute', 'prod-alef-core-d1', '--local', '--command', sql], {
	stdio: 'inherit',
	cwd: join(process.cwd(), 'src/db'),
});

console.log('Done');
process.exit(0);
