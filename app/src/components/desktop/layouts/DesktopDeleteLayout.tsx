import { Icon, Button, Dialog, Box, Text } from '@alef/sys';
import { useDeleteRoomLayout, useActiveRoomLayoutId, useRoomLayout, useRoomLayoutIds } from '@/stores/roomStore';
import { useCallback } from 'react';
import { PrefixedId } from '@alef/common';
import { useContainerStore } from '../stores/useContainer';
export function DesktopDeleteLayout() {
	const layoutIds = useRoomLayoutIds();

	const [activeLayoutId] = useActiveRoomLayoutId();
	const layoutData = useRoomLayout(activeLayoutId);

	return (
		<Dialog>
			<Dialog.Trigger asChild>
				<Button color="destructive">
					<Icon name="trash" />
				</Button>
			</Dialog.Trigger>
			{layoutIds.length > 1 ? <CanDeleteLayout name={layoutData?.name ?? ''} layoutId={activeLayoutId} /> : <CannotDeleteLayout />}
		</Dialog>
	);
}

function CanDeleteLayout({ name, layoutId }: { name: string; layoutId: PrefixedId<'rl'> }) {
	const deleteLayout = useDeleteRoomLayout();

	const container = useContainerStore((state) => state.container);

	const handleDelete = useCallback(() => {
		deleteLayout(layoutId);
	}, [deleteLayout, layoutId]);

	return (
		<Dialog.Content title="Delete Layout" container={container}>
			<Dialog.Description>
				Are you sure you want to delete <b>{name}</b>?
			</Dialog.Description>
			<Box full="width" stacked align="center" justify="center">
				<Text>
					<i>This action cannot be undone.</i>
				</Text>
			</Box>
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
	);
}

function CannotDeleteLayout() {
	const container = useContainerStore((state) => state.container);

	return (
		<Dialog.Content title={`Unable to Delete Layout`} container={container}>
			<Dialog.Description>You must have at least one layout.</Dialog.Description>
			<Dialog.Close asChild>
				<Button>Cancel</Button>
			</Dialog.Close>
		</Dialog.Content>
	);
}
