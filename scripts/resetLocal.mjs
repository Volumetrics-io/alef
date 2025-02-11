import { confirm, isCancel, tasks } from '@clack/prompts';
import { spawn } from 'node:child_process';
import * as fs from 'node:fs/promises';
import { join } from 'path/posix';

export async function spawnAsync(cmd, args, { cwd }) {
	return new Promise((resolve, reject) => {
		const proc = spawn(cmd, args, { cwd });
		proc.stdout.pipe(process.stdout);
		proc.stderr.pipe(process.stderr);
		proc.on('close', (code) => {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`Exited with code ${code}`));
			}
		});
	});
}

const result = await confirm({
	message: 'Are you sure you want to delete the local environment databases?',
});

if (!result || isCancel(result)) {
	outro('Bye');
	process.exit(0);
}

const deletes = await Promise.allSettled([
	fs.rm('./services/src/db/.wrangler', { recursive: true }),
	fs.rm('./services/src/admin-api/.wrangler', { recursive: true }),
	fs.rm('./services/src/public-api/.wrangler', { recursive: true }),
]);

if (deletes.some(({ status }) => status === 'rejected')) {
	console.error('Failed to delete some databases');
	console.error(deletes.filter(({ status }) => status === 'rejected').map(({ reason }) => reason));
}

console.log('Local environment databases deleted.');

await tasks([
	{
		task: async (msg) => {
			await spawnAsync('pnpm', ['run', 'migrations:apply:local'], {
				cwd: join(process.cwd(), 'services'),
			});
			return 'Migrated database';
		},
		title: 'Migrating the database',
	},
]);

process.exit(0);
