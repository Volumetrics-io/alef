import { intro, isCancel, outro, tasks, text } from '@clack/prompts';
import { spawn } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

async function spawnAsync(cmd, args, { cwd }) {
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

intro('Setting up the repo');

const devVarsRaw = await text({
	message: 'Paste the value of the Bitwarden secure note "Alef Cloudflare .dev.vars" here, or press Enter to skip this step',
	placeholder: '...',
});

if (isCancel(devVarsRaw)) {
	outro('Bye');
	process.exit(0);
}

const devVars = devVarsRaw?.split('\\n').join('\n') || '';
const appEnv = `VITE_PUBLIC_API_ORIGIN=http://localhost:4201
VITE_ADMIN_API_ORIGIN=http://localhost:4202
VITE_MAIN_UI_ORIGIN=http://localhost:4200
VITE_ADMIN_UI_ORIGIN=http://localhost:4203
`;
await tasks([
	{
		task: async (msg) => {
			const serviceDirs = readdirSync(join(process.cwd(), 'services/src'));
			for (const path of serviceDirs.filter((dir) => dir !== 'middleware')) {
				await writeFile(join(process.cwd(), 'services/src', path, '.dev.vars'), devVars, { encoding: 'utf8' });
				msg(`Wrote to ${path}`);
			}
			return 'Wrote .dev.vars files';
		},
		title: 'Writing .dev.vars to service directories',
		enabled: devVars.length > 0,
	},
	{
		task: async (msg) => {
			await writeFile(join(process.cwd(), 'app', '.env'), appEnv, { encoding: 'utf8' });
			msg('Wrote to app .env');
			await writeFile(join(process.cwd(), 'admin', '.env'), appEnv, { encoding: 'utf8' });
			msg('Wrote to admin .env');
			return 'Wrote .env files';
		},
		title: 'Writing .env to UI projects',
	},
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

const email = await text({
	message: 'Enter your user email address',
	placeholder: 'hi@alef.io',
});

if (isCancel(email)) {
	outro('Cancelled');
	process.exit(0);
}

const password = await text({
	message: 'Enter your user password',
	placeholder: '...',
});

if (isCancel(password)) {
	outro('Cancelled');
	process.exit(0);
}

const name = await text({
	message: 'Enter your user name',
	placeholder: '...',
});

if (isCancel(name)) {
	outro('Cancelled');
	process.exit(0);
}

await tasks([
	{
		task: async (msg) => {
			await spawnAsync('pnpm', ['run', 'createUser', email, password, name, 'true'], {
				cwd: join(process.cwd(), 'services'),
			});
			return 'Created user';
		},
		title: 'Creating your user',
		enabled: !!email && !!password,
	},
]);

outro('Done');
