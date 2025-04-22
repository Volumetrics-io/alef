import { confirm, intro, isCancel, outro, text } from '@clack/prompts';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

intro('Grant your local organization all product features');

const email = await text({
	message: 'Enter your email address',
	placeholder: 'hi@alef.io',
});

if (isCancel(email)) {
	outro('Bye');
	process.exit(0);
}

const selectSql = `select Organization.id
	from Organization
	inner join Membership on Organization.id = Membership.organizationId
	inner join User on Membership.userId = User.id
	where User.email = '${email}';`;

const result = spawnSync('pnpx', ['wrangler', 'd1', 'execute', 'prod-alef-core-d1', '--local', '--command', `${selectSql}`], {
	cwd: join(process.cwd(), 'services/src/db'),
});

if (result.error || result.status !== 0) {
	outro('Failed. Scroll up.');
}

const idMatch = /or-[a-z0-9]+/g.exec(result.stdout.toString());
const id = idMatch ? idMatch[0] : null;
if (!id) {
	outro('No organization found for this email');
	process.exit(0);
}

const sql = `update Organization
set hasExtendedAIAccess = true
where Organization.id = '${id}';`;

const ok = await confirm({
	message: `Are you sure you want to run this SQL command?\n\n${sql}`,
});

if (!ok || isCancel(ok)) {
	outro('Bye');
	process.exit(0);
}
const result2 = spawnSync('pnpx', ['wrangler', 'd1', 'execute', 'prod-alef-core-d1', '--local', '--command', `${sql}`], {
	stdio: 'inherit',
	cwd: join(process.cwd(), 'services/src/db'),
});
if (result2.error || result2.status !== 0) {
	outro('Failed. Scroll up.');
}

outro('Done');
