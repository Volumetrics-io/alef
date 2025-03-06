import { FurnitureData, publicApiClient } from '@/services/publicApi';
import { Attribute } from '@alef/common';
import { Box, Button, Card, ScrollArea } from '@alef/sys';
import { useInfiniteQuery } from '@tanstack/react-query';
import { FurnitureCard } from './FurnitureCard';

export interface FilteredFurnitureProps {
	filters: Attribute[];
}

export function FilteredFurniture({ filters }: FilteredFurnitureProps) {
	const { data, fetchNextPage } = useFilteredFurniture(filters);
	const allFurniture = data?.pages.flatMap((page) => page.items) ?? [];
	const hasMore = data?.pages[data.pages.length - 1].pageInfo.hasNextPage;
	return (
		<Box stacked gapped full>
			<FilteredFurnitureGrid furniture={allFurniture} />
			{hasMore && <Button onClick={() => fetchNextPage()}>Load More</Button>}
		</Box>
	);
}

export function FilteredFurnitureGrid({ furniture }: { furniture: FurnitureData[] }) {
	return (
		<ScrollArea>

		<Card.Grid full>
				{furniture?.map((furniture) => (
					<FurnitureCard key={furniture.id} furniture={furniture} />
				))}
			</Card.Grid>
		</ScrollArea>
	);
}

export function useFilteredFurniture(filters: Attribute[], options?: { enabled?: boolean }) {
	return useInfiniteQuery({
		queryKey: ['furniture', ...filters.map((attr) => `${attr.key}:${attr.value}`)],
		queryFn: async ({ queryKey, pageParam }) => {
			const [, ...attributes] = queryKey;
			const response = await publicApiClient.furniture.$get({
				query: {
					attribute: attributes,
					page: pageParam.toString(),
					pageSize: '10',
				},
			});
			if (!response.ok) {
				throw new Error(`Error: ${response.statusText}`);
			}
			return response.json();
		},
		enabled: options?.enabled,
		initialPageParam: 0,
		getNextPageParam: (lastPage) => {
			return lastPage.pageInfo.nextPage ?? 0;
		},
	});
}
