import { publicApiOrigin } from '@/env';
import { createFetch } from '@a-type/auth-fetch';

export const fetch = createFetch({
	refreshSessionEndpoint: `${publicApiOrigin}/auth/refresh`,
	logoutEndpoint: `${publicApiOrigin}/auth/logout`,
});
