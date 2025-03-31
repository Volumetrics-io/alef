import { useFurnitureDetails } from '@/services/publicApi/furnitureHooks';
import { useFurniturePlacement, useFurniturePlacementIds } from '@/stores/roomStore';
import { useIsSelected, useSelect } from '@/stores/roomStore/hooks/editing';
import { PrefixedId } from '@alef/common';
import { CardGrid, ScrollArea } from '@alef/sys';
import { DesktopFurnitureCard } from './DesktopFurnitureCard';

export function DesktopPlacedFurnitureList() {
	const ids = useFurniturePlacementIds();

	return (
		<ScrollArea>
			<CardGrid small p="small">
				{ids.map((id) => (
					<DesktopPlacedFurnitureCard key={id} id={id} />
				))}
			</CardGrid>
		</ScrollArea>
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
