import { PrefixedId } from '@alef/common';
import { useSuspenseQuery } from '@tanstack/react-query';
import { InferResponseType } from 'hono';
import { publicApiClient } from './client';
import { fallbackWhenOfflineOrError, handleErrors } from './utils';

export function useAllProperties() {
	return useSuspenseQuery({
		queryKey: ['properties'],
		queryFn: async () => {
			return fallbackWhenOfflineOrError(publicApiClient.properties.$get(), []);
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

export type PropertyResponse = InferResponseType<(typeof publicApiClient.properties)[':id']['$get']>;
