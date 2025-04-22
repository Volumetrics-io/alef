import { PrefixedId } from '@alef/common';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { InferResponseType } from 'hono';
import { queryClient } from '../queryClient';
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

export function useUpdateProperty(id: PrefixedId<'p'>) {
	return useMutation({
		mutationFn: async (info: { name: string }) => {
			return handleErrors(
				publicApiClient.properties[':id'].$put({
					param: { id },
					json: info,
				})
			);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['properties'],
			});
		},
	});
}

export function useCreateProperty() {
	return useMutation({
		mutationFn: async (info: { name: string }) => {
			return handleErrors(
				publicApiClient.properties.$post({
					json: info,
				})
			);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['properties'],
			});
		},
	});
}

export type PropertyResponse = InferResponseType<(typeof publicApiClient.properties)[':id']['$get']>;
