import { PrefixedId } from '@alef/common';
import { useSuspenseQuery } from '@tanstack/react-query';
import { publicApiClient } from './client';
import { handleErrors } from './utils';

export function useAllProperties() {
	return useSuspenseQuery({
		queryKey: ['properties'],
		queryFn: async () => {
			return handleErrors(publicApiClient.properties.$get());
		},
	});
}

export function useProperty(propertyId: PrefixedId<'p'>) {
	return useSuspenseQuery({
		queryKey: ['properties', propertyId],
		queryFn: async () => {
			return handleErrors(
				publicApiClient.properties[':id'].$get({
					param: { id: propertyId },
				})
			);
		},
	});
}
