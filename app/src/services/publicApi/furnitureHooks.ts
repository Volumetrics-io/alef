import { publicApiOrigin } from '@/env';
import { AlefError, AttributeKey, formatAttribute, FurnitureModelQuality } from '@alef/common';
import { useGLTF } from '@react-three/drei';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { InferResponseType } from 'hono/client';
import { publicApiClient } from './client';

export function useAllFurniture(
	options: {
		attributeFilter?: { key: AttributeKey; value: string }[];
	} = {}
) {
	return useSuspenseQuery({
		queryKey: ['furniture', ...(options.attributeFilter ?? []).map(({ key, value }) => `attr.${key}=${value}`).sort()],
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

export function useAllFurnitureAttributes() {
	return useSuspenseQuery({
		queryKey: ['attributes', null],
		queryFn: async () => {
			const response = await publicApiClient.furniture.attributes.$get({ query: { key: undefined } });
			return response.json();
		},
	});
}

export function useFurnitureAttributes(key: AttributeKey) {
	return useSuspenseQuery({
		queryKey: ['attributes', key],
		queryFn: async () => {
			const response = await publicApiClient.furniture.attributes.$get({ query: { key } });
			return response.json();
		},
	});
}
export function useFurnitureModel(furnitureId: string, quality: FurnitureModelQuality = FurnitureModelQuality.Original) {
	const src = `${publicApiOrigin}/furniture/${furnitureId}/model?quality=${quality}`;
	return useGLTF(src, true, true, (loader) => {
		loader.setWithCredentials(true);
	});
}

export type FurnitureItem = InferResponseType<typeof publicApiClient.furniture.$get>[0];
