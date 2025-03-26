import { useViewingRoomId } from '@/hooks/useViewingRoomId';
import { PrefixedId } from '@alef/common';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
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

/**
 * Logged in users only. Creates a new room in the property
 * and switches over to it.
 */
export function useCreateRoom(propertyId: PrefixedId<'p'>) {
	const [, setViewingRoomId] = useViewingRoomId();
	return useCallback(async () => {
		const result = await handleErrors(
			publicApiClient.properties[':id'].rooms.$post({
				param: { id: propertyId },
			})
		);
		setViewingRoomId(result.id);
	}, [setViewingRoomId, propertyId]);
}
