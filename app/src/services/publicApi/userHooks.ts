import { AlefError } from '@alef/common';
import { useSuspenseQuery } from '@tanstack/react-query';
import { publicApiClient } from './client';

export function useMe() {
	return useSuspenseQuery({
		queryKey: ['me'],
		queryFn: async () => {
			const response = await publicApiClient.users.me.$get();
			AlefError.throwIfFailed(response);
			return response.json();
		},
	});
}
