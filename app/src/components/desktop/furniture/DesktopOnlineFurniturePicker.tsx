import { useAllFurniture, useFurnitureAttributes } from '@/services/publicApi/furnitureHooks';
import { useAllFilters } from '@/stores/FilterStore';
import { PrefixedId } from '@alef/common';
import { Box, BoxProps, Heading, ScrollArea } from '@alef/sys';
import { Suspense } from 'react';
import { DesktopFurnitureAttributePicker } from './DesktopFurnitureAttributePicker';
import { DesktopFurnitureCategoryFilter } from './DesktopFurnitureCategoryFilter';
import { DesktopFurnitureCollection } from './DesktopFurnitureCollection';

export interface DesktopOnlineFurniturePickerProps extends Omit<BoxProps, 'onSelect'> {
	onSelect?: (id: PrefixedId<'f'>) => void;
}

export function DesktopOnlineFurniturePicker({ onSelect, ...props }: DesktopOnlineFurniturePickerProps) {
	return (
		<Box full stacked gapped p="small" {...props}>
			<DesktopFurnitureFilters />
			<ScrollArea>
				<Suspense>
					<DesktopFilteredFurniture onSelect={onSelect} />
				</Suspense>
			</ScrollArea>
		</Box>
	);
}

function DesktopFurnitureFilters() {
	const { data: typeOptions } = useFurnitureAttributes('type');
	return (
		<Box gapped stacked>
			<DesktopFurnitureCategoryFilter />
			<Heading level={3}>Types</Heading>
			<DesktopFurnitureAttributePicker attributeKey="type" options={typeOptions.map((v) => ({ key: 'type', value: v }))} />
		</Box>
	);
}

function DesktopFilteredFurniture({ onSelect }: { onSelect?: (id: PrefixedId<'f'>) => void }) {
	const attributes = useAllFilters();
	const { data: furniture, fetchNextPage } = useAllFurniture({
		attributeFilter: attributes,
	});

	const allFurniture = furniture.pages.flatMap((page) => page.items);
	const hasMore = furniture.pages[furniture.pages.length - 1].pageInfo.hasNextPage;

	return <DesktopFurnitureCollection furniture={allFurniture} hasMore={hasMore} onLoadMore={() => fetchNextPage()} onSelect={onSelect} />;
}
