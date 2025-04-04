import { useHasSelectedRoom, useSelectRoom } from '@/stores/propertyStore/hooks/editing';
import { useRoomIds } from '@/stores/propertyStore/hooks/rooms';
import { useEffect, useState } from 'react';

export function useSelectRoomBlocker({ closeOnSelect }: { closeOnSelect?: boolean } = {}) {
	const hasSelectedRoom = useHasSelectedRoom();
	const roomIds = useRoomIds();

	const startWithSelectorVisible = roomIds.length !== 1;

	const [showSelector, setShowSelector] = useState(startWithSelectorVisible);

	// if there's just one room, select it automatically
	const onlyRoomId = roomIds.length === 1 && roomIds[0];
	const selectRoom = useSelectRoom();
	useEffect(() => {
		if (onlyRoomId) {
			selectRoom(onlyRoomId);
		}
	}, [onlyRoomId, selectRoom]);

	const showContent = hasSelectedRoom;
	const close = () => {
		setShowSelector(false);
	};

	const finalShowSelector = showSelector && (!closeOnSelect || !hasSelectedRoom);
	// TODO: auto-select room based on similarity to detected floor plane in XR if
	// multiple rooms are available.

	return { showContent, showSelector: finalShowSelector, close };
}
