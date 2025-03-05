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
			<FurniturePanelFilterSidebarSectionHeader label="Categories">
			</FurniturePanelFilterSidebarSectionHeader>
			<CategoryFilter />
			<FurniturePanelFilterSidebarSectionHeader label="Types" />
			<FurnitureAttributePicker options={typeOptions} />
		</FurniturePanelFilterSidebar>
	);
}

function FilteredFurniture() {
	const attributes = useAllFilters();
	const { data: furniture } = useAllFurniture({
		attributeFilter: attributes,
	});

	return <FurnitureCollection furniture={furniture} />;
}
