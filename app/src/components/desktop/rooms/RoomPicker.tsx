import { useSelectRoom } from '@/stores/propertyStore/hooks/editing';
import { useDeleteRoom, useRoomCreatedAt, useRoomIds, useSelectedRoomId } from '@/stores/propertyStore/hooks/rooms';
import { isPrefixedId, PrefixedId } from '@alef/common';
import { Box, Button, Dialog, Frame, Icon, Select, Text } from '@alef/sys';
import { useState } from 'react';
import cls from './RoomPicker.module.css';

export interface RoomPickerProps {}

export function RoomPicker({}: RoomPickerProps) {
	const selectedRoomId = useSelectedRoomId();
	const selectRoom = useSelectRoom();
	const roomIds = useRoomIds();
	const [dialogOpen, setDialogOpen] = useState(false);

	// hide if no rooms to select from.
	if (roomIds.length < 2 && !dialogOpen) {
		return null;
	}

	return (
		<Frame float="top-center" layout="center center" p="squeeze">
			<Select
				placeholder="Select a room"
				className={cls.select}
				value={selectedRoomId || ''}
				onValueChange={(v) => {
					if (!v) {
						// not allowed to select nothing.
						return;
					}
					if (!isPrefixedId(v, 'r')) {
						// something's up.
						return;
					}
					selectRoom(v);
				}}
			>
				{roomIds.map((id, index) => (
					<RoomPickerItem key={id} index={index} roomId={id} />
				))}
			</Select>
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<Dialog.Trigger asChild>
					<Button color="ghost" layout="center center" p="small">
						<Icon name="settings" className={cls.settingsIcon} />
					</Button>
				</Dialog.Trigger>
				<Dialog.Content title="Manage rooms">
					<ManageRooms />
					<Dialog.Actions>
						<Dialog.Close asChild>
							<Button>Done</Button>
						</Dialog.Close>
					</Dialog.Actions>
				</Dialog.Content>
			</Dialog>
		</Frame>
	);
}

function RoomPickerItem({ roomId, index }: { roomId: PrefixedId<'r'>; index: number }) {
	return (
		<Select.Item value={roomId}>
			<RoomLabel roomId={roomId} index={index} />
		</Select.Item>
	);
}

function ManageRooms() {
	const roomIds = useRoomIds();
	const deleteRoom = useDeleteRoom();
	const selectedRoomId = useSelectedRoomId();

	return (
		<Box stacked gapped>
			{roomIds.map((id, idx) => (
				<Box key={id} gapped align="center">
					<Box gapped stretched>
						<Icon name="check" style={{ visibility: selectedRoomId === id ? 'visible' : 'hidden' }} />
						<RoomLabel roomId={id} index={idx} />
					</Box>
					<Button color="destructive" onClick={() => deleteRoom(id)}>
						<Icon name="trash" />
					</Button>
				</Box>
			))}
		</Box>
	);
}

function RoomLabel({ roomId, index }: { roomId: PrefixedId<'r'>; index: number }) {
	const createdAt = useRoomCreatedAt(roomId);
	return (
		<Text>
			Room {index + 1} ({new Date(createdAt).toLocaleDateString()})
		</Text>
	);
}
