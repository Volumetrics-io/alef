import { AlefError } from '@alef/common';
import { useSuspenseQuery } from '@tanstack/react-query';
import { publicApiClient } from './client';

export function useMe() {
	return useSuspenseQuery({
		queryKey: ['me'],
		queryFn: async () => {
			const response = await publicApiClient.users.me.$get();
			const asAlefError = AlefError.fromResponse(response);
			// return null if the user is not logged in
			if (asAlefError && asAlefError.code === AlefError.Code.Unauthorized) {
				return null;
			} else if (asAlefError) {
				throw asAlefError;
			}
			return response.json();
		},
	});
}
