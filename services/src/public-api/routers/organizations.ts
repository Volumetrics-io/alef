import { Hono } from 'hono';
import { wrapRpcData } from '../../helpers/wrapRpcData';
import { userStoreMiddleware } from '../../middleware/session';
import { sessions } from '../auth/session';
import { Env } from '../config/ctx';

export const organizationsRouter = new Hono<Env>().use(userStoreMiddleware).get('/default', async (ctx) => {
	// get the active organization for this session.
	const organizationId = ctx.get('session').organizationId;
	if (!organizationId) {
		// user has not selected an organization yet
		// select a default and apply it to the session
		const userStore = ctx.get('userStore');
		const organizations = await userStore.getOrganizations();
		let selectedOrg = organizations[0];
		if (!selectedOrg) {
			// no organizations found for this user... this is a bad state but
			// we can correct it now.
			selectedOrg = await userStore.createOrganization('Default Organization');
		}

		const updates = await sessions.updateSession(
			{
				...ctx.get('session'),
				organizationId: selectedOrg.id,
			},
			ctx
		);

		const headers = {} as Record<string, string[]>;
		if (updates) {
			for (const [key, value] of updates.headers.entries()) {
				headers[key] ??= [];
				headers[key].push(value);
			}
		}

		return ctx.json(wrapRpcData(selectedOrg), 200, headers);
	}
	const userStore = ctx.get('userStore');
	const organization = await userStore.getOrganization(organizationId);
	return ctx.json(wrapRpcData(organization));
});
// TODO: list organizations, switch organizations
