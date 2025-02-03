import { AlefError } from '@alef/common';
import { useSuspenseQuery } from '@tanstack/react-query';
import { publicApiClient } from './client';
import { handleErrors } from './utils';

export function useMe() {
	return useSuspenseQuery({
		queryKey: ['me'],
		queryFn: async () => {
			try {
				return await handleErrors(publicApiClient.users.me.$get());
			} catch (err) {
				// catch a 401 and return null. it's ok.
				if (AlefError.isInstance(err) && err.statusCode === 401) {
					return null;
				}
			}
		},
	});
}

export function useIsLoggedIn() {
	return !!useMe().data;
}
