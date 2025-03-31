import { FurnitureItem, useFurnitureDetails } from '@/services/publicApi/furnitureHooks';
import { useFurniturePlacement, useFurniturePlacementIds } from '@/stores/roomStore';
import { useIsSelected, useSelect } from '@/stores/roomStore/hooks/editing';
import { PrefixedId } from '@alef/common';
import { CardGrid, Dialog, ScrollArea } from '@alef/sys';
import { useContainerStore } from '../stores/useContainer';
import { DesktopFurnitureCard } from './DesktopFurnitureCard';
import { DesktopSelectedFurnitureTools } from './DesktopFurnitureTools';

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

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			select(null);
		} else {
			select(id);
		}
	};

	return (
		<Dialog open={isSelected} onOpenChange={handleOpenChange}>
			<Dialog.Trigger
				asChild
				onClick={() => {
					select(id);
				}}
			>
				<DesktopFurnitureCard item={furnitureData} isSelected={isSelected} />
			</Dialog.Trigger>
			<FurnitureDetailsDialogContent item={furnitureData} placementId={id} />
		</Dialog>
	);
}

function FurnitureDetailsDialogContent({ item, placementId }: { item: FurnitureItem; placementId: PrefixedId<'fp'> }) {
	const container = useContainerStore((state) => state.container);

	return (
		<Dialog.Content title={item.name} container={container}>
			<img src={`${import.meta.env.VITE_PUBLIC_API_ORIGIN}/furniture/${item.id}/image.jpg`} />
			<DesktopSelectedFurnitureTools id={placementId} />
		</Dialog.Content>
	);
}
