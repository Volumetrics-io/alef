import { useFurnitureDetails } from '@/services/publicApi/furnitureHooks';
import { useFurniturePlacement, useFurniturePlacementIds } from '@/stores/roomStore';
import { useIsSelected, useSelect } from '@/stores/roomStore/hooks/editing';
import { PrefixedId } from '@alef/common';
import { Box, BoxProps, Button, Icon, ScrollArea } from '@alef/sys';
import { Suspense } from 'react';

export interface DesktopPlacedFurnitureListProps extends BoxProps {}

export function DesktopPlacedFurnitureList(props: DesktopPlacedFurnitureListProps) {
	const ids = useFurniturePlacementIds();

	return (
		<ScrollArea>
			<Box p="small" stacked gapped {...props}>
				{ids.map((id) => (
					<DesktopPlacedFurnitureListItem key={id} id={id} />
				))}
			</Box>
		</ScrollArea>
	);
}

function DesktopPlacedFurnitureListItem({ id }: { id: PrefixedId<'fp'> }) {
	const placement = useFurniturePlacement(id);
	const select = useSelect();
	const isSelected = useIsSelected(id);

	if (!placement) return null;

	return (
		<Button justify="start" onClick={() => select(id)}>
			<Suspense fallback={<span>Furniture</span>}>
				<DesktopPlacedFurnitureListItemName furnitureId={placement.furnitureId} />
			</Suspense>
			{isSelected && <Icon name="check" style={{ marginLeft: 'auto' }} />}
		</Button>
	);
}

function DesktopPlacedFurnitureListItemName({ furnitureId }: { furnitureId: PrefixedId<'f'> }) {
	const { data: furnitureData } = useFurnitureDetails(furnitureId);

	return <span>{furnitureData?.name ?? 'Furniture'}</span>;
}
