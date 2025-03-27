import { publicApiOrigin } from '@/env';
import { createFetch } from '@a-type/auth-fetch';
import { AlefError } from '@alef/common';

export const fetch = createFetch({
	refreshSessionEndpoint: `${publicApiOrigin}/auth/refresh`,
	logoutEndpoint: `${publicApiOrigin}/auth/logout`,
	isSessionExpired: (res) => {
		const asAlefError = AlefError.fromResponse(res);
		if (asAlefError) {
			return asAlefError.code === AlefError.Code.SessionExpired;
		}
		return false;
	},
});
