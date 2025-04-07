import { createFetch } from '@a-type/auth-fetch';

export const fetch = createFetch({
	refreshSessionEndpoint: `${import.meta.env.VITE_PUBLIC_API_ORIGIN}/auth/refresh`,
	logoutEndpoint: `${import.meta.env.VITE_PUBLIC_API_ORIGIN}/auth/logout`,
});
