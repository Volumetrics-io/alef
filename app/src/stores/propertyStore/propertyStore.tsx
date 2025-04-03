import { PropertySocket } from '@/services/publicApi/socket';
import { Operation, PrefixedId, RoomState, RoomStateWithEditor } from '@alef/common';
import { useEffect, useRef } from 'react';
import { createStore, useStore } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createHistoryApi } from './historyApi';
import { migratePropertyStore, PROPERTY_STORE_VERSION } from './migration';
import { createPropertyApi, PropertyApi } from './propertyApi';
import { usePropertyStoreContext } from './Provider';
import { createRoomApi, RoomApi } from './roomApi';
import { getStorageKey, loadProperty, migrateLocalPropertyIfNeeded } from './setup';
import { listenToSocketEvents } from './socket';

export type PropertyStoreState = {
	// persisted
	rooms: Record<PrefixedId<'r'>, RoomStateWithEditor>;
	meta: {
		propertyId: PrefixedId<'p'>;
		operationBacklog: Operation[];
		selectedRoomId: PrefixedId<'r'> | null;
	};

	// ephemeral
	roomApis: Record<PrefixedId<'r'>, RoomApi>;
	api: PropertyApi;
	propertySocket: PropertySocket | null;
	history: {
		undoStack: Operation[];
		redoStack: Operation[];
		undo(): void;
		redo(): void;
	};
};

export type PersistedPropertyStoreState = Pick<PropertyStoreState, 'rooms' | 'meta'>;

export const makePropertyStore = async (propertyId: PrefixedId<'p'> | null) => {
	console.debug('Loading property store', { propertyId });
	const { rooms, propertySocket, id } = await loadProperty(propertyId);
	console.debug('Property store loaded', { id, rooms });

	const store = createStore<PropertyStoreState>()(
		persist(
			immer(
				subscribeWithSelector((set, get): PropertyStoreState => {
					const firstRoomId = Object.keys(rooms)[0] as PrefixedId<'r'> | undefined;
					const roomApis = Object.keys(rooms).reduce(
						(acc, roomId) => {
							const roomApi = createRoomApi(roomId as PrefixedId<'r'>)(set, get);
							acc[roomId as PrefixedId<'r'>] = roomApi;
							return acc;
						},
						{} as Record<PrefixedId<'r'>, RoomApi>
					);

					const roomsWithEditors = Object.entries(rooms).reduce(
						(acc, [roomId, room]) => {
							const firstLayoutId = Object.keys(room.layouts)[0] as PrefixedId<'rl'> | undefined;
							const roomWithEditor = {
								...(room as RoomState),
								editor: {
									mode: 'layouts' as const,
									placingFurnitureId: null,
									selectedObjectId: null,
									selectedLayoutId: firstLayoutId || null,
								},
							};
							acc[roomId as PrefixedId<'r'>] = roomWithEditor;
							return acc;
						},
						{} as Record<PrefixedId<'r'>, RoomStateWithEditor>
					);

					return {
						rooms: roomsWithEditors,
						roomApis,
						propertySocket,
						meta: {
							propertyId: id,
							operationBacklog: [],
							selectedRoomId: firstRoomId || null,
						},
						api: createPropertyApi(set, get),
						history: createHistoryApi(set, get),
					};
				})
			),
			{
				name: getStorageKey(id),
				version: PROPERTY_STORE_VERSION,
				partialize(state) {
					const { meta, rooms } = state;
					return { meta, rooms };
				},
				migrate(persistedState, version) {
					return migratePropertyStore(persistedState, version);
				},
				merge(persistedRaw, initialState): PropertyStoreState {
					if (!persistedRaw) {
						return initialState;
					}
					const persistedState = persistedRaw as PersistedPropertyStoreState;
					// merge initial rooms (which either come from a blank demo state,
					// or the API if this is an API-backed property) with persisted rooms.
					// This logic is not ideal.
					// For API-backed properties we want to take the API value of the room
					// as it's more authoritative. For local only properties, we
					// want to restore the persisted value, as otherwise persistence doesn't
					// do anything.
					const isApiBacked = !!propertyId;
					const mergedRooms = isApiBacked
						? {
								...persistedState.rooms,
								...initialState.rooms,
							}
						: {
								...initialState.rooms,
								...persistedState.rooms,
							};
					return {
						...initialState,
						meta: {
							...persistedState.meta,
							// do not restore selected room. we will either
							// default to a singular room, detect a room from the
							// headset plane data, or ask the user to select one
							// on launch
							selectedRoomId: null,
						},
						rooms: mergedRooms,
					};
				},
			}
		)
	);

	// this property is backed by our API, so we do some things...
	if (propertySocket) {
		listenToSocketEvents(propertySocket, store.setState, store.getState);
		migrateLocalPropertyIfNeeded(store);
	}

	return store;
};

export type PropertyStore = Awaited<ReturnType<typeof makePropertyStore>>;

export function usePropertyStore<T>(selector: (state: PropertyStoreState) => T) {
	const store = usePropertyStoreContext();
	return useStore(store, selector);
}

export function usePropertyStoreSubscribe<T>(
	selector: (state: PropertyStoreState) => T,
	listener: (state: T) => void,
	options?: { fireImmediately?: boolean; equalityFn?: (a: T, b: T) => boolean }
) {
	const store = usePropertyStoreContext();
	const stable = useRef({ selector, listener, options });
	stable.current.selector = selector;
	stable.current.listener = listener;
	stable.current.options = options;
	useEffect(
		() =>
			store.subscribe(
				(v) => stable.current.selector(v),
				(v) => stable.current.listener(v),
				stable.current.options
			),
		[store]
	);
}
