import { useSelectRoomBlocker } from '@/components/core/useSelectRoomBlocker';
import { useHasSelectedRoom, useSelectRoom } from '@/stores/propertyStore/hooks/editing';
import { useRoomCreatedAt, useRoomIds } from '@/stores/propertyStore/hooks/rooms';
import { PrefixedId } from '@alef/common';
import { Container, Root, Text } from '@react-three/uikit';
import { ReactNode } from 'react';
import { Vector3 } from 'three';
import { BodyAnchor } from '../anchors';
import { Button } from '../ui/Button';
import { Defaults } from '../ui/Defaults';
import { Heading } from '../ui/Heading';
import { Surface } from '../ui/Surface';

/**
 * To render anything, we must have a room selected first.
 *
 * If no rooms exist, we need to create one.
 *
 * Children will not be rendered until a room is selected.
 */
export function SelectRoomBlocker({ children }: { children: ReactNode }) {
	const { showContent, showSelector, close } = useSelectRoomBlocker();

	return (
		<>
			{showSelector && <RoomSelectorPanel onClose={close} />}
			{showContent && children}
		</>
	);
}

function RoomSelectorPanel({ onClose }: { onClose: () => void }) {
	const roomIds = useRoomIds();
	const hasSelectedRoom = useHasSelectedRoom();
	const selectRoom = useSelectRoom();

	return (
		<BodyAnchor follow lockY distance={0.1} position={new Vector3(0, -0.1, 0.5)}>
			<Root pixelSize={0.001} flexDirection="column" gap={10}>
				<Defaults>
					<Surface width={300} height={300} flexDirection="column" flexWrap="no-wrap" gap={10} padding={10}>
						<Heading level={1}>Select a room</Heading>
						<Text>Select a room to start editing.</Text>
						<Container overflow="scroll" flexGrow={1} flexShrink={1} gap={5} flexDirection="column">
							{roomIds.map((id, index) => (
								<RoomItem key={id} roomId={id} onSelect={() => selectRoom(id)} index={index} />
							))}
						</Container>
						{hasSelectedRoom && (
							<Button onClick={onClose}>
								<Text>Done</Text>
							</Button>
						)}
					</Surface>
				</Defaults>
			</Root>
		</BodyAnchor>
	);
}

function RoomItem({ onSelect, roomId, index }: { onSelect: () => void; roomId: PrefixedId<'r'>; index: number }) {
	const createdAt = useRoomCreatedAt(roomId);
	return (
		<Button onClick={onSelect}>
			<Text>
				Room {index + 1} (created {new Date(createdAt).toLocaleDateString()})
			</Text>
		</Button>
	);
}
