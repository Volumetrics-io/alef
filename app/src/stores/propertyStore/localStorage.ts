import { PrefixedId } from '@alef/common';

export const LOCAL_ROOM_ID: PrefixedId<'r'> = 'r-local';

export function getRoomStorageKey(roomId: PrefixedId<'r'>) {
	return `room-${roomId}`;
}

export function getHasLocalRoom() {
	return localStorage.getItem(getRoomStorageKey(LOCAL_ROOM_ID)) !== null;
}
