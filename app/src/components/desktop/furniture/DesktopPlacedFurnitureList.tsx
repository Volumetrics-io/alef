import { useFurnitureDetails } from '@/services/publicApi/furnitureHooks';
import { useFurniturePlacement, useFurniturePlacementIds } from '@/stores/propertyStore';
import { useIsSelected, useSelect } from '@/stores/propertyStore/hooks/editing';
import { PrefixedId } from '@alef/common';
import { CardGrid } from '@alef/sys';
import { DesktopFurnitureCard } from './DesktopFurnitureCard';

export function DesktopPlacedFurnitureList() {
	const ids = useFurniturePlacementIds();

	return (
		<CardGrid small p="small">
			{ids.map((id) => (
				<DesktopPlacedFurnitureCard key={id} id={id} />
			))}
		</CardGrid>
	);
}

function DesktopPlacedFurnitureCard({ id }: { id: PrefixedId<'fp'> }) {
	const placement = useFurniturePlacement(id);
	const select = useSelect();
	const isSelected = useIsSelected(id);
	const { data: furnitureData } = useFurnitureDetails(placement?.furnitureId ?? null);

	if (!placement) return null;
	if (!furnitureData) return null;

	return <DesktopFurnitureCard item={furnitureData} isSelected={isSelected} onClick={() => select(id)} />;
}
