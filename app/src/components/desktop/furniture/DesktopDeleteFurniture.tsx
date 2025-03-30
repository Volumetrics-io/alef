import { Icon, Button, Dialog } from '@alef/sys';
import { useCallback } from 'react';
import { useContainerStore } from '../stores/useContainer';
import { useSelect, useSelectedFurniturePlacementId } from '@/stores/roomStore/hooks/editing';
import { useDeleteFurniturePlacement } from '@/stores/roomStore';
export function DesktopDeleteFurniture() {
	const selectedPlacementId = useSelectedFurniturePlacementId();
	if (!selectedPlacementId) return null;
	const deleteFurniturePlacement = useDeleteFurniturePlacement(selectedPlacementId);
	const select = useSelect();

	const container = useContainerStore((state) => state.container);

	const handleDelete = useCallback(() => {
		select(null);
		deleteFurniturePlacement();
	}, [deleteFurniturePlacement]);

	return (
		<Dialog>
			<Dialog.Trigger asChild>
				<Button color="destructive" grow>
					<Icon name="trash" />
				</Button>
			</Dialog.Trigger>
			<Dialog.Content title="Delete asset" container={container}>
				<Dialog.Description>Are you sure you want to delete this object?</Dialog.Description>
				<Dialog.Actions>
					<Dialog.Close asChild>
						<Button color="destructive" onClick={handleDelete}>
							Delete
						</Button>
					</Dialog.Close>
					<Dialog.Close asChild>
						<Button>Cancel</Button>
					</Dialog.Close>
				</Dialog.Actions>
			</Dialog.Content>
		</Dialog>
	);
}
