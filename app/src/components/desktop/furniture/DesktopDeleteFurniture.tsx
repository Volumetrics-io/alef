import { useDeleteFurniturePlacement } from '@/stores/roomStore';
import { useSelect } from '@/stores/roomStore/hooks/editing';
import { PrefixedId } from '@alef/common';
import { Button, Dialog, Icon } from '@alef/sys';
import { useCallback } from 'react';

export function DesktopDeleteFurniture({ placementId }: { placementId: PrefixedId<'fp'> }) {
	const deleteFurniturePlacement = useDeleteFurniturePlacement(placementId);
	const select = useSelect();

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
			<Dialog.Content title="Delete asset">
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
