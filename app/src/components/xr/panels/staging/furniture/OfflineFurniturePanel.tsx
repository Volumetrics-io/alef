import { FurnitureItem, useAllFurniture } from '@/services/publicApi/furnitureHooks';
import { useAllFilters } from '@/stores/FilterStore';
import { Attribute } from '@alef/common';
import { Container, Text } from '@react-three/uikit';
import { colors } from '@react-three/uikit-default';
import { TriangleAlertIcon } from '@react-three/uikit-lucide';
import { useMemo } from 'react';
import {
	CategoryFilter,
	FurnitureAttributePicker,
	FurnitureCollection,
	FurniturePanelFilterSidebar,
	FurniturePanelFilterSidebarSectionHeader,
	FurniturePanelHeader,
	FurniturePanelNavigation,
} from './common';

export function OfflineFurniturePanel() {
	// we can only use one precached query when offline.
	// CAREFUL. THIS MUST MATCH THE SAME EXACT FILTERS IN THE SERVICE WORKER.
	const { data } = useAllFurniture({
		attributeFilter: [
			// our precached query is for furniture in the core package
			{ key: 'package', value: 'core' },
		],
		pageSize: 1000,
	});
	const furnitureUnfiltered = data.pages[0].items;

	// since the precached furniture is unfiltered by the API, we have
	// to apply any selected attribute filters on it manually on the client.
	const filters = useAllFilters();
	const furniture = useMemo(() => {
		return furnitureUnfiltered.filter((furniture) => {
			// furniture must match attributes with the following rules:
			// when multiple attribute values with the same key are selected,
			//  the furniture must match any one of those values
			// when multiple attributes of DIFFERENT keys are selected,
			//  the furniture must match at least one value for each key.
			// e.g. if we have selected 'chair' and 'sofa' for 'type' and 'living room' for 'category',
			//  the furniture must be either a chair or a sofa and must be in the living room category.
			const filtersGroupedByKey = filters.reduce(
				(acc, filter) => {
					if (!acc[filter.key]) {
						acc[filter.key] = [];
					}
					acc[filter.key].push(filter.value);
					return acc;
				},
				{} as Record<string, string[]>
			);
			return Object.entries(filtersGroupedByKey).every(([key, values]) => {
				const attribute = furniture.attributes.find((attribute) => attribute.key === key);
				if (!attribute) {
					return false;
				}
				return values.includes(attribute.value);
			});
		});
	}, [filters, furnitureUnfiltered]);

	return (
		<>
			<FurnitureFilters furnitureUnfiltered={furnitureUnfiltered} />
			<OfflineModeWarning />
			<FurniturePanelHeader />
			<FurnitureCollection furniture={furniture} />
			<FurniturePanelNavigation />
		</>
	);
}

function FurnitureFilters({ furnitureUnfiltered }: { furnitureUnfiltered: FurnitureItem[] }) {
	// the offline version 'detects' possible furniture types from the list we have.
	const types = useMemo(() => {
		const types = furnitureUnfiltered
			.map((furniture) => furniture.attributes.find((attribute) => attribute.key === 'type'))
			.filter((attribute): attribute is { key: 'type'; value: string } => !!attribute);
		return [...new Set(types.map((type) => type.value))];
	}, [furnitureUnfiltered]);

	return (
		<FurniturePanelFilterSidebar>
			<FurniturePanelFilterSidebarSectionHeader label="Categories"></FurniturePanelFilterSidebarSectionHeader>
			<CategoryFilter />
			<FurniturePanelFilterSidebarSectionHeader label="Types" />
			<FurnitureAttributePicker options={types.map((type): Attribute => ({ key: 'type', value: type }))} />
		</FurniturePanelFilterSidebar>
	);
}

function OfflineModeWarning() {
	return (
		<Container paddingX={10} gap={5} paddingY={4} borderRadius={4} backgroundColor={colors.destructive} width="100%" alignItems="center" justifyContent="center">
			<TriangleAlertIcon color={colors.destructiveForeground} width={15} height={15} />
			<Text color={colors.destructiveForeground} fontSize={12}>
				You are offline. Only core furniture is available.
			</Text>
		</Container>
	);
}
