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
import { useState } from 'react';

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
			<FurnitureAttributePicker options={typeOptions.map((value) => ({ key: 'type', value }))} />
		</FurniturePanelFilterSidebar>
	);
}

function FilteredFurniture() {
	const attributes = useAllFilters();
	const { data: furniture, fetchNextPage } = useAllFurniture({
		attributeFilter: attributes,
		pageSize: 6,
	});

	const [currentPageIndex, setCurrentPageIndex] = useState(0);

	const goToPrevious = () => {
		setCurrentPageIndex(currentPageIndex - 1);
	};

	const goToNext = () => {
		if (currentPageIndex === furniture.pages.length - 1) {
			fetchNextPage().then(() => {
				setCurrentPageIndex(currentPageIndex + 1);
			});
		} else {
			setCurrentPageIndex(currentPageIndex + 1);
		}
	};

	const currentPage = furniture.pages[currentPageIndex];
	const hasMore = currentPage.pageInfo.hasNextPage;

	return <FurnitureCollection furniture={currentPage.items} hasPrevious={currentPageIndex > 0} hasNext={hasMore} onPrevious={goToPrevious} onNext={goToNext} />;
}
