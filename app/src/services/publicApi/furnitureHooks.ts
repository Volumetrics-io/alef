import { publicApiOrigin } from '@/env';
import { AlefError, AttributeKey, formatAttribute, FurnitureModelQuality } from '@alef/common';
import { useGLTF } from '@react-three/drei';
import { useSuspenseInfiniteQuery, useSuspenseQuery } from '@tanstack/react-query';
import type { InferResponseType } from 'hono/client';
import { publicApiClient } from './client';

export function useAllFurniture(
	options: {
		attributeFilter?: { key: AttributeKey; value: string }[];
		pageSize?: number;
	} = {}
) {
	return useSuspenseInfiniteQuery({
		queryKey: ['furniture', ...(options.attributeFilter ?? []).map(({ key, value }) => `attr.${key}=${value}`).sort()],
		queryFn: async ({ pageParam }) => {
			const response = await publicApiClient.furniture.$get({
				query: {
					attribute: options.attributeFilter?.map(formatAttribute),
					page: pageParam.toString(),
					pageSize: options.pageSize?.toString(),
				},
			});
			AlefError.throwIfFailed(response);
			return response.json();
		},
		initialPageParam: 0,
		getNextPageParam: (lastPage, pages) => {
			return lastPage.pageInfo.nextPage ?? 0;
		},
	});
}

export function useAllFurnitureAttributes() {
	return useSuspenseQuery({
		queryKey: ['attributes', null],
		queryFn: async () => {
			const response = await publicApiClient.furniture.attributes.$get();
			return response.json();
		},
	});
}

export function useFurnitureAttributes(key: AttributeKey) {
	return useSuspenseQuery({
		queryKey: ['attributes', key],
		queryFn: async () => {
			const response = await publicApiClient.furniture.attributes[':key'].$get({ param: { key } });
			return response.json();
		},
	});
}

export function useFurnitureDetails(furnitureId: string) {
	return useSuspenseQuery({
		queryKey: ['id', furnitureId],
		queryFn: async () => {
			const response = await publicApiClient.furniture[':id'].$get({ param: { id: furnitureId } });
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

export type FurnitureItem = InferResponseType<typeof publicApiClient.furniture.$get>['items'][0];
