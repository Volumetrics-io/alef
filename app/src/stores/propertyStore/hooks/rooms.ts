import { PrefixedId, RoomStateWithEditor } from '@alef/common';
import { useShallow } from 'zustand/react/shallow';
import { usePropertyStore, usePropertyStoreSubscribe } from '../propertyStore';
import { RoomApi } from '../roomApi';

export function useRoomState<T>(selector: (s: RoomStateWithEditor) => T) {
	return usePropertyStore((state) => {
		if (!state.meta.selectedRoomId) {
			throw new Error('No room selected. Invalid useRoomState invocation');
		}
		const room = state.rooms[state.meta.selectedRoomId];
		if (!room) {
			throw new Error('No room found. Invalid useRoomState invocation');
		}
		return selector(room);
	});
}

export function useRoomApi<T>(selector: (s: RoomApi) => T) {
	return usePropertyStore((state) => {
		if (!state.meta.selectedRoomId) {
			throw new Error('No room selected. Invalid useRoomApi invocation');
		}
		const roomApi = state.roomApis[state.meta.selectedRoomId];
		if (!roomApi) {
			throw new Error('No room API found. Invalid useRoomApi invocation');
		}
		return selector(roomApi);
	});
}

export function useRoomStateSubscribe<T>(
	selector: (s: RoomStateWithEditor) => T,
	listener: (state: T) => void,
	options?: { fireImmediately?: boolean; equalityFn?: (a: T, b: T) => boolean }
) {
	return usePropertyStoreSubscribe(
		(state) => {
			if (!state.meta.selectedRoomId) {
				throw new Error('No room selected. Invalid useRoomState invocation');
			}
			return selector(state.rooms[state.meta.selectedRoomId]);
		},
		listener,
		options
	);
}

export function useRoomIds() {
	return usePropertyStore(useShallow((state) => Object.keys(state.rooms) as PrefixedId<'r'>[]));
}

export function useCreateRoom() {
	return usePropertyStore((state) => state.api.createRoom);
}

export function useRoomCreatedAt(id: PrefixedId<'r'>) {
	return usePropertyStore((state) => state.rooms[id].createdAt);
}
