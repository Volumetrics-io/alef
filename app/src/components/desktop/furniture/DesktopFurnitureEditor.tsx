import { useDeleteFurniturePlacement, useFurniturePlacement, useFurnitureQuickSwap } from '@/stores/roomStore';
import { useSelectedFurniturePlacementId } from '@/stores/roomStore/hooks/editing';
import { RoomFurniturePlacement } from '@alef/common';
import { Box, Button, Heading, Icon, Text } from '@alef/sys';
import { Suspense } from 'react';
import { FurnitureName } from './FurnitureName';

export function DesktopFurnitureEditor() {
	const selectedId = useSelectedFurniturePlacementId();
	const placement = useFurniturePlacement(selectedId || 'fp-none');

	if (!placement) {
		return null;
	}

	return <DesktopFurnitureEditorImpl placement={placement} />;
}

function DesktopFurnitureEditorImpl({ placement }: { placement: RoomFurniturePlacement }) {
	const deleteSelf = useDeleteFurniturePlacement(placement.id);
	const { swapPrevious, swapNext } = useFurnitureQuickSwap(placement);

	return (
		<Box stacked gapped full p="small">
			<Heading level={4}>Quick swap</Heading>
			<Box gapped layout="center between">
				<Button onClick={swapPrevious}>
					<Icon name="arrow-left" />
				</Button>
				<Suspense fallback={<Text>...</Text>}>
					<FurnitureName furnitureId={placement.furnitureId} />
				</Suspense>
				<Button onClick={swapNext}>
					<Icon name="arrow-right" />
				</Button>
			</Box>
			<Heading level={4}>Manage</Heading>
			<Button color="destructive" onClick={deleteSelf}>
				<Icon name="trash" />
				Delete
			</Button>
		</Box>
	);
}
