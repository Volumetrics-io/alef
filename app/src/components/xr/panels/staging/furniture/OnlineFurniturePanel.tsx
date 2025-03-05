import { useAllFurniture, useFurnitureAttributes } from '@/services/publicApi/furnitureHooks';
import { useAllFilters } from '@/stores/FilterStore';
import {
	CategoryFilter,
	FurnitureAttributePicker,
	FurnitureCollection,
	FurniturePanelFilterSidebar,
	FurniturePanelFilterSidebarSectionHeader,
	FurniturePanelHeader,
	FurniturePanelNavigation,
} from './common';

export function OnlineFurniturePanel() {
	return (
		<>
			<FurnitureFilters />
			<FurniturePanelHeader />
			<FilteredFurniture />
			<FurniturePanelNavigation />
		</>
	);
}

function FurnitureFilters() {
	const { data: typeOptions } = useFurnitureAttributes('type');

	return (
		<FurniturePanelFilterSidebar>
			<FurniturePanelFilterSidebarSectionHeader label="Categories"></FurniturePanelFilterSidebarSectionHeader>
			<CategoryFilter />
			<FurniturePanelFilterSidebarSectionHeader label="Types" />
			<FurnitureAttributePicker options={typeOptions} />
		</FurniturePanelFilterSidebar>
	);
}

function FilteredFurniture() {
	const attributes = useAllFilters();
	const { data: furniture, fetchNextPage } = useAllFurniture({
		attributeFilter: attributes,
	});

	const allFurniture = furniture.pages.flatMap((page) => page.items);
	const hasMore = furniture.pages[furniture.pages.length - 1].pageInfo.hasNextPage;

	return <FurnitureCollection furniture={allFurniture} hasMore={hasMore} onLoadMore={() => fetchNextPage()} />;
}
