import { FurnitureData, publicApiClient } from '@/services/publicApi';
import { Attribute } from '@alef/common';
import { Card } from '@alef/sys';
import { useQuery } from '@tanstack/react-query';
import { FurnitureCard } from './FurnitureCard';

export interface FilteredFurnitureProps {
	filters: Attribute[];
}

export function FilteredFurniture({ filters }: FilteredFurnitureProps) {
	const { data } = useFilteredFurniture(filters);
	return <FilteredFurnitureGrid furniture={data || []} />;
}

export function FilteredFurnitureGrid({ furniture }: { furniture: FurnitureData[] }) {
	return <Card.Grid full>{furniture?.map((furniture) => <FurnitureCard key={furniture.id} furniture={furniture} />)}</Card.Grid>;
}

export function useFilteredFurniture(filters: Attribute[], options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: ['furniture', ...filters.map((attr) => `${attr.key}:${attr.value}`)],
		queryFn: async ({ queryKey }) => {
			const [, ...attributes] = queryKey;
			const response = await publicApiClient.furniture.$get({
				query: {
					attribute: attributes,
				},
			});
			if (!response.ok) {
				throw new Error(`Error: ${response.statusText}`);
			}
			return response.json();
		},
		enabled: options?.enabled,
	});
}
