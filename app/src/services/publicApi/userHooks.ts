import { AlefError } from '@alef/common';
import { useSuspenseQuery } from '@tanstack/react-query';
import { publicApiClient } from './client';

export function useMe() {
	return useSuspenseQuery({
		queryKey: ['me'],
		queryFn: async () => {
			const response = await publicApiClient.users.me.$get();
			const asAlefError = AlefError.fromResponse(response);
			// our whole app is authorized, so this should always redirect to login
			if (asAlefError && asAlefError.code === AlefError.Code.Unauthorized) {
				if (typeof window === 'undefined') {
					throw asAlefError;
				}
				if (window.location.pathname !== '/login') {
					window.location.href = '/login';
					throw asAlefError;
				} else {
					throw asAlefError;
				}
			} else if (asAlefError) {
				throw asAlefError;
			}
			return response.json();
		},
	});
}
