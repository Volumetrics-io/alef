import { FurnitureItem, useFurnitureDetails } from '@/services/publicApi/furnitureHooks';
import { useFurniturePlacement, useFurniturePlacementIds } from '@/stores/roomStore';
import { useIsSelected, useSelect, useSelectedFurniturePlacementId } from '@/stores/roomStore/hooks/editing';
import { PrefixedId } from '@alef/common';
import { CardGrid, Dialog, ScrollArea } from '@alef/sys';
import { DesktopFurnitureCard } from './DesktopFurnitureCard';
import { DesktopSelectedFurnitureTools } from './DesktopFurnitureTools';
import { useContainerStore } from '../stores/useContainer';

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

	if (!placement) return null;

	const { data: furnitureData } = useFurnitureDetails(placement.furnitureId);

	if (!furnitureData) return null;

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			select(null);
		}
	};

	return (
		<Dialog onOpenChange={handleOpenChange}>
			<Dialog.Trigger
				asChild
				onClick={() => {
					select(id);
				}}
			>
				<DesktopFurnitureCard item={furnitureData} isSelected={isSelected} />
			</Dialog.Trigger>
			<FurnitureDetailsDialogContent item={furnitureData} />
		</Dialog>
	);
}

function FurnitureDetailsDialogContent({ item }: { item: FurnitureItem }) {
	const container = useContainerStore((state) => state.container);

	const selectedPlacementId = useSelectedFurniturePlacementId();

	return (
		<Dialog.Content title={item.name} container={container}>
			<img src={`${import.meta.env.VITE_PUBLIC_API_ORIGIN}/furniture/${item.id}/image.jpg`} />
			{selectedPlacementId && <DesktopSelectedFurnitureTools id={selectedPlacementId} />}
		</Dialog.Content>
	);
}
