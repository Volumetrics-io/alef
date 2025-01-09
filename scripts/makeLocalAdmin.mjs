import { confirm, intro, isCancel, outro, text } from '@clack/prompts';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

intro('Make yourself an admin on localhost');

const email = await text({
	message: 'Enter your email address',
	placeholder: 'hi@alef.io',
});

if (isCancel(email)) {
	outro('Bye');
	process.exit(0);
}

const sql = `update User set isProductAdmin = true where email = '${email}';`;

const ok = await confirm({
	message: `Are you sure you want to run this SQL command?\n\n${sql}`,
});

if (!ok || isCancel(ok)) {
	outro('Bye');
	process.exit(0);
}

const result = spawnSync('pnpx', ['wrangler', 'd1', 'execute', 'prod-alef-core-d1', '--local', '--command', `${sql}`], {
	stdio: 'inherit',
	cwd: join(process.cwd(), 'services/src/db'),
});

if (result.error || result.status !== 0) {
	outro('Failed. Scroll up.');
}

outro('Done');
