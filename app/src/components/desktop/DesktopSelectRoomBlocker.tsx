import { useSelectRoom } from '@/stores/propertyStore/hooks/editing';
import { useRoomCreatedAt, useRoomIds } from '@/stores/propertyStore/hooks/rooms';
import { PrefixedId } from '@alef/common';
import { Button, Dialog } from '@alef/sys';
import { ReactNode } from 'react';
import { useSelectRoomBlocker } from '../core/useSelectRoomBlocker';

export function DesktopSelectRoomBlocker({ children }: { children: ReactNode }) {
	const { showContent, showSelector } = useSelectRoomBlocker({ closeOnSelect: true });

	return (
		<>
			{showSelector && !showContent && <RoomSelectorPanel />}
			{showContent && children}
		</>
	);
}

function RoomSelectorPanel() {
	const roomIds = useRoomIds();
	const selectRoom = useSelectRoom();

	return (
		<Dialog open>
			<Dialog.Content title={roomIds.length === 0 ? 'Create a room' : 'Select a room'}>
				<Dialog.Description>Select a room to continue</Dialog.Description>
				{roomIds.map((roomId, index) => (
					<RoomItem key={roomId} index={index} roomId={roomId} onSelect={() => selectRoom(roomId)} />
				))}
			</Dialog.Content>
		</Dialog>
	);
}

function RoomItem({ onSelect, roomId, index }: { onSelect: () => void; roomId: PrefixedId<'r'>; index: number }) {
	const createdAt = useRoomCreatedAt(roomId);
	return (
		<Button onClick={onSelect} variant="action">
			Room {index + 1} (created {new Date(createdAt).toLocaleDateString()})
		</Button>
	);
}
