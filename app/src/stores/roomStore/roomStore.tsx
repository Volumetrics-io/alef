import { PropertySocket } from '@/services/publicApi/socket';
import {
	getDefaultRoomState,
	getUndo,
	id,
	migrateRoomState,
	Operation,
	PrefixedId,
	ROOM_STATE_VERSION,
	RoomFurniturePlacement,
	RoomGlobalLighting,
	RoomLayout,
	RoomLightPlacement,
	RoomState,
	UnknownRoomPlaneData,
	updateRoom,
} from '@alef/common';
import { useEffect, useRef } from 'react';
import { createStore, useStore } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useRoomStoreContext } from './Provider';

export type RoomStoreState = RoomState & {
	// client state
	viewingLayoutId?: PrefixedId<'rl'>;
	operationBacklog: Operation[];
	undoStack: Operation[];
	redoStack: Operation[];

	undo(): void;
	redo(): void;

	/**
	 * Creates an empty new room layout and sets it as the current layout
	 */
	createLayout: (data?: { name?: string }) => Promise<PrefixedId<'rl'>>;
	setViewingLayoutId: (id: PrefixedId<'rl'>) => void;
	updateLayout: (data: Pick<RoomLayout, 'id' | 'name' | 'icon' | 'type'>) => void;
	updatePlanes: (planes: UnknownRoomPlaneData[]) => void;
	deleteLayout: (id: PrefixedId<'rl'>) => void;

	// furniture APIs
	addFurniture: (init: Omit<RoomFurniturePlacement, 'id'>) => Promise<string>;
	updateFurnitureId: (id: PrefixedId<'fp'>, furnitureId: PrefixedId<'f'>) => Promise<void>;
	moveFurniture: (
		id: PrefixedId<'fp'>,
		transform: {
			position?: { x: number; y: number; z: number };
			rotation?: { x: number; y: number; z: number; w: number };
		}
	) => Promise<void>;
	deleteFurniture: (id: PrefixedId<'fp'>) => Promise<void>;

	// light APIs
	addLight: (init: Omit<RoomLightPlacement, 'id'>) => Promise<string>;
	moveLight: (
		id: PrefixedId<'lp'>,
		transform: {
			position?: { x: number; y: number; z: number };
		}
	) => Promise<void>;
	deleteLight: (id: PrefixedId<'lp'>) => Promise<void>;
	updateGlobalLighting: (update: Partial<RoomGlobalLighting>) => Promise<void>;
};

export const makeRoomStore = (roomId: PrefixedId<'r'>, socket: PropertySocket | null) =>
	createStore<RoomStoreState>()(
		persist(
			immer(
				subscribeWithSelector((set, get): RoomStoreState => {
					// request initial layout state and load into store on creation
					if (socket) {
						(async () => {
							const response = await socket.request(
								{
									type: 'requestRoom',
									roomId,
								},
								'roomUpdate'
							);
							set({
								...response.data,
								// pick an arbitrary layout to view
								viewingLayoutId: Object.keys(response.data.layouts)[0] as PrefixedId<'rl'> | undefined,
							});
						})();
						socket.onMessage('roomUpdate', (data) => {
							// apply incoming room updates
							set((state) => {
								Object.assign(state, data);
							});
						});
						// apply backlog on connect
						socket.onConnect(async () => {
							const backlog = get().operationBacklog;
							if (backlog.length) {
								await socket.request({
									type: 'applyOperations',
									operations: backlog,
								});
								// clear backlog on success
								set((state) => {
									state.operationBacklog = [];
								});
							}
						});
					}

					function getLayoutId() {
						const id = get().viewingLayoutId;
						if (!id) {
							throw new Error('No layout selected');
						}
						return id;
					}

					async function applyChange(
						op: Operation,
						{ historyStack = 'undoStack', disableClearRedo }: { historyStack?: 'undoStack' | 'redoStack'; disableClearRedo?: boolean } = {}
					): Promise<void> {
						// apply change and add to undo stack
						set((state) => {
							const undo = getUndo(state, op);
							updateRoom(state, op);
							if (undo) {
								state[historyStack].push(undo);
							}
						});

						// send to server
						// client-only -- don't bother keeping a backlog.
						if (!socket) return;

						if (socket?.isClosed) {
							set((state) => {
								state.operationBacklog.push(op);
								if (!disableClearRedo) {
									state.redoStack = [];
								}
							});
						} else {
							try {
								await socket.request({
									type: 'applyOperations',
									operations: [op],
								});
								if (!disableClearRedo) {
									set((state) => {
										state.redoStack = [];
									});
								}
							} catch (e) {
								if (e instanceof Error && e.message === 'Request timed out') {
									set((state) => {
										state.operationBacklog.push(op);
										if (!disableClearRedo) {
											state.redoStack = [];
										}
									});
								}
							}
						}
					}

					return {
						...getDefaultRoomState(roomId),
						id: roomId,
						operationBacklog: [],
						undoStack: [],
						redoStack: [],
						viewingLayoutId: undefined,

						undo: () => {
							const undo = get().undoStack[get().undoStack.length - 1];
							if (undo) {
								applyChange(undo, { historyStack: 'redoStack', disableClearRedo: true });
								set((state) => {
									state.undoStack.pop();
								});
							}
						},
						redo: () => {
							const redo = get().redoStack[get().redoStack.length - 1];
							if (redo) {
								applyChange(redo, { historyStack: 'undoStack', disableClearRedo: true });
								set((state) => {
									state.redoStack.pop();
								});
							}
						},

						updatePlanes: async (planes) => {
							console.debug('Updating XR planes. There are:', planes.length, 'planes detected');
							await applyChange({
								type: 'updatePlanes',
								roomId,
								planes,
								time: Date.now(),
							});
						},

						createLayout: async (data) => {
							const name = data?.name || `Layout ${Object.keys(get().layouts).length + 1}`;
							const layoutId = id('rl');
							await applyChange({
								type: 'createLayout',
								roomId,
								data: { id: layoutId, name },
							});
							if (!get().viewingLayoutId) {
								set({ viewingLayoutId: layoutId });
							}

							return layoutId;
						},
						setViewingLayoutId(id) {
							set({ viewingLayoutId: id });
						},
						updateLayout: async (data) => {
							await applyChange({
								type: 'updateLayout',
								roomId,
								data,
							});
						},

						deleteLayout: async (id) => {
							await applyChange({
								type: 'deleteLayout',
								roomId,
								roomLayoutId: id,
							});
							set((state) => {
								if (state.viewingLayoutId === id) {
									const newLayoutId = Object.keys(state.layouts)[0] as PrefixedId<'rl'> | undefined;
									state.viewingLayoutId = newLayoutId;
								}
							});
						},

						addFurniture: async (init) => {
							const placementId = id('fp');
							const layoutId = getLayoutId();
							const placement = {
								id: placementId,
								...init,
							};

							await applyChange({
								type: 'addFurniture',
								roomId,
								roomLayoutId: layoutId,
								data: placement,
							});

							return placementId;
						},
						moveFurniture: async (id, { position, rotation }) => {
							await applyChange({
								type: 'updateFurniture',
								roomId,
								roomLayoutId: getLayoutId(),
								data: {
									id,
									// transform to pojos
									position: position && { x: position.x, y: position.y, z: position.z },
									rotation: rotation && { x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w },
								},
							});
						},
						updateFurnitureId: async (id, furnitureId) => {
							await applyChange({
								type: 'updateFurniture',
								roomId,
								roomLayoutId: getLayoutId(),
								data: {
									id,
									furnitureId,
								},
							});
						},
						deleteFurniture: async (id) => {
							await applyChange({
								type: 'removeFurniture',
								roomId,
								roomLayoutId: getLayoutId(),
								id,
							});
						},

						addLight: async (init) => {
							const placementId = id('lp');
							const placement = {
								id: placementId,
								...init,
							};
							await applyChange({
								type: 'addLight',
								roomId,
								data: placement,
							});
							return placementId;
						},
						moveLight: async (id, { position }) => {
							await applyChange({
								type: 'updateLight',
								roomId,
								data: {
									id,
									position,
								},
							});
						},
						deleteLight: async (id) => {
							await applyChange({
								type: 'removeLight',
								roomId,
								id,
							});
						},
						updateGlobalLighting: async (update) => {
							await applyChange({
								type: 'updateGlobalLighting',
								roomId,
								data: update,
							});
						},
					} satisfies RoomStoreState;
				})
			),
			{
				name: `room-${roomId}`,
				version: ROOM_STATE_VERSION,
				partialize(state) {
					const { id, version, layouts, lights, globalLighting, operationBacklog: messageBacklog, planes, viewingLayoutId } = state;
					return {
						id,
						version,
						layouts,
						lights,
						globalLighting,
						messageBacklog,
						planes,
						viewingLayoutId,
					};
				},
				migrate(persistedState, version) {
					return {
						messageBacklog: [],
						viewingLayoutId: undefined,
						...migrateRoomState(persistedState),
					};
				},
				onRehydrateStorage() {
					// if no layouts exist, create a default one
					return (state) => {
						if (state?.layouts && Object.keys(state.layouts).length === 0) {
							state.createLayout();
						}
					};
				},
			}
		)
	);
export type RoomStore = ReturnType<typeof makeRoomStore>;

export function useRoomStore<T>(selector: (s: RoomStoreState) => T) {
	const store = useRoomStoreContext();
	return useStore(store, selector);
}

export function useRoomStoreSubscribe<T>(
	selector: (s: RoomStoreState) => T,
	listener: (state: T) => void,
	options?: { fireImmediately?: boolean; equalityFn?: (a: T, b: T) => boolean }
) {
	const store = useRoomStoreContext();
	const stable = useRef({ listener, options });
	stable.current.listener = listener;
	stable.current.options = options;
	useEffect(
		() =>
			store.subscribe(
				selector,
				(v) => {
					stable.current.listener(v);
				},
				stable.current.options
			),
		[store, selector]
	);
}
