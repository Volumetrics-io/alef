import { publicApiOrigin } from '@/env';
import { AlefError, AttributeKey, formatAttribute } from '@alef/common';
import { useGLTF } from '@react-three/drei';
import { useSuspenseQuery } from '@tanstack/react-query';
import { publicApiClient } from './client';

export function useAllFurniture(
	options: {
		attributeFilter?: { key: AttributeKey; value: string }[];
	} = {}
) {
	return useSuspenseQuery({
		queryKey: ['furniture', ...(options.attributeFilter ?? []).map(({ key, value }) => `attr.${key}=${value}`)],
		queryFn: async () => {
			const response = await publicApiClient.furniture.$get({
				query: {
					attribute: options.attributeFilter?.map(formatAttribute),
				},
			});
			AlefError.throwIfFailed(response);
			return response.json();
		},
	});
}

export function useFurnitureModelSrc(furnitureId: string) {
	const src = `${publicApiOrigin}/furniture/${furnitureId}/model`;
	return useGLTF(src);
}
