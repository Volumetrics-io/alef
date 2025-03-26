import { PropertySocket } from '@/services/publicApi/socket';
import {
	createOp,
	DistributiveOmit,
	EditorMode,
	getDemoRoomState,
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
	RoomStateWithEditor,
	RoomType,
	UnknownRoomPlaneData,
	updateRoom,
} from '@alef/common';
import { sentenceCase } from 'change-case';
import { useEffect, useRef } from 'react';
import { createStore, useStore } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useRoomStoreContext } from './Provider';

export type RoomStoreState = RoomStateWithEditor & {
	// undo/redo and buffer of unsent operations (only used for logged in clients)
	operationBacklog: Operation[];
	undoStack: Operation[];
	redoStack: Operation[];
	undo(): void;
	redo(): void;

	// Editor actions
	select: (id: PrefixedId<'fp'> | PrefixedId<'lp'> | null) => void;
	setPlacingFurniture: (furnitureId: PrefixedId<'f'> | null) => void;
	setEditorMode: (mode: EditorMode) => void;

	/**
	 * Creates an empty new room layout and sets it as the current layout
	 */
	createLayout: (data?: { name?: string; type?: RoomType }) => Promise<PrefixedId<'rl'>>;
	setViewingLayoutId: (id: PrefixedId<'rl'>) => void;
	updateLayout: (data: Pick<RoomLayout, 'id' | 'name' | 'icon' | 'type'>) => void;
	updatePlanes: (planes: UnknownRoomPlaneData[]) => void;
	clearPlanes: () => void;
	deleteLayout: (id: PrefixedId<'rl'>) => void;

	// furniture APIs
	addFurniture: (init: Omit<RoomFurniturePlacement, 'id'>) => Promise<PrefixedId<'fp'>>;
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
	addLight: (init: Omit<RoomLightPlacement, 'id'>) => Promise<PrefixedId<'lp'>>;
	moveLight: (
		id: PrefixedId<'lp'>,
		transform: {
			position?: { x: number; y: number; z: number };
		}
	) => Promise<void>;
	deleteLight: (id: PrefixedId<'lp'>) => Promise<void>;
	updateGlobalLighting: (update: Partial<RoomGlobalLighting>, options?: { localOnly?: boolean }) => Promise<void>;
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
							});
						})();
						socket.onMessage('roomUpdate', (msg) => {
							// apply incoming room updates
							console.log('Applying room update', msg);
							set((state) => {
								Object.assign(state, msg.data);
							});
						});
						socket.onMessage('syncOperations', (msg) => {
							// check we haven't seen each op already
							set((state) => {
								for (const op of msg.operations) {
									if (seenOps.has(op.opId)) continue;
									updateRoom(state, op);
								}
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
						const id = get().editor.selectedLayoutId;
						if (!id) {
							throw new Error('No layout selected');
						}
						return id;
					}

					const seenOps = new Set<string>();
					async function localChange(
						opInit: DistributiveOmit<Operation, 'roomId' | 'opId'>,
						{
							historyStack = 'undoStack',
							disableClearRedo,
							localOnly,
							disableHistory = localOnly,
							personal,
						}: { historyStack?: 'undoStack' | 'redoStack'; disableClearRedo?: boolean; localOnly?: boolean; disableHistory?: boolean; personal?: boolean } = {}
					): Promise<void> {
						const op = createOp({ roomId, ...opInit });
						seenOps.add(op.opId);

						try {
							// apply change and add to undo stack
							set((state) => {
								const undo = getUndo(state, op);
								updateRoom(state, op);
								if (undo && !disableHistory) {
									state[historyStack].push(undo);
								}
							});
						} catch (err) {
							console.error('Failed to apply operation:', op, err);
							// do nothing, ignore this change.
							return;
						}

						// send to server
						// client-only -- don't bother keeping a backlog.
						if (!socket || localOnly) return;

						if (socket?.isClosed) {
							set((state) => {
								if (!personal) {
									state.operationBacklog.push(op);
								}
								if (!disableClearRedo) {
									state.redoStack = [];
								}
							});
						} else {
							try {
								await socket.request({
									type: 'applyOperations',
									operations: [op],
									personal,
								});
								if (!disableClearRedo) {
									set((state) => {
										state.redoStack = [];
									});
								}
							} catch (e) {
								if (e instanceof Error && e.message === 'Request timed out') {
									set((state) => {
										if (!personal) {
											state.operationBacklog.push(op);
										}
										if (!disableClearRedo) {
											state.redoStack = [];
										}
									});
								}
							}
						}
					}

					const defaultState = getDemoRoomState(roomId);
					const firstLayoutId = Object.keys(defaultState.layouts)[0] as PrefixedId<'rl'> | null;
					return {
						...defaultState,
						id: roomId,
						operationBacklog: [],
						undoStack: [],
						redoStack: [],

						editor: {
							mode: 'layouts',
							placingFurnitureId: null,
							selectedObjectId: null,
							selectedLayoutId: firstLayoutId,
						},

						undo: async () => {
							const undo = get().undoStack[get().undoStack.length - 1];
							if (undo) {
								await localChange(undo, { historyStack: 'redoStack', disableClearRedo: true });
								set((state) => {
									state.undoStack.pop();
								});
							}
						},
						redo: async () => {
							const redo = get().redoStack[get().redoStack.length - 1];
							if (redo) {
								await localChange(redo, { historyStack: 'undoStack', disableClearRedo: true });
								set((state) => {
									state.redoStack.pop();
								});
							}
						},

						select: (id) => {
							return localChange(
								{
									type: 'selectObject',
									objectId: id,
								},
								{
									personal: true,
								}
							);
						},
						setPlacingFurniture: (furnitureId) => {
							return localChange(
								{
									type: 'setPlacingFurniture',
									furnitureId,
								},
								{
									personal: true,
								}
							);
						},
						setEditorMode: (mode) => {
							return localChange(
								{
									type: 'setEditorMode',
									mode,
								},
								{
									personal: true,
								}
							);
						},

						updatePlanes: async (planes) => {
							await localChange({
								type: 'updatePlanes',
								planes,
								time: Date.now(),
							});
						},
						clearPlanes: async () => {
							await localChange({
								type: 'clearPlanes',
							});
						},

						createLayout: async (data) => {
							let name = data?.name;
							const type: RoomType = data?.type || 'living-room';
							if (!name) {
								// name it after the room type, incrementing as needed
								const nameFromType = sentenceCase(type);
								const othersWithName = Object.values(get().layouts).filter((layout) => layout?.name?.startsWith(nameFromType)).length;
								name = `${nameFromType}${othersWithName > 0 ? ' ' + (othersWithName + 1) : ''}`;
							}
							const layoutId = id('rl');
							await localChange({
								type: 'createLayout',
								data: { id: layoutId, name, type },
							});
							await localChange({
								type: 'selectLayout',
								layoutId,
							});

							return layoutId;
						},
						async setViewingLayoutId(id) {
							await localChange({
								type: 'selectLayout',
								layoutId: id,
							});
						},
						updateLayout: async (data) => {
							await localChange({
								type: 'updateLayout',
								data,
							});
						},

						deleteLayout: async (id) => {
							await localChange({
								type: 'deleteLayout',
								layoutId: id,
							});
							if (get().editor.selectedLayoutId === id) {
								const newLayoutId = Object.keys(get().layouts)[0] as PrefixedId<'rl'> | null;
								if (newLayoutId) {
									await localChange({ type: 'selectLayout', layoutId: newLayoutId });
								}
							}
						},

						addFurniture: async (init) => {
							const placementId = id('fp');
							const layoutId = getLayoutId();
							const placement = {
								id: placementId,
								...init,
							};

							await localChange({
								type: 'addFurniture',
								roomLayoutId: layoutId,
								data: placement,
							});

							return placementId;
						},
						moveFurniture: async (id, { position, rotation }) => {
							await localChange({
								type: 'updateFurniture',
								layoutId: getLayoutId(),
								data: {
									id,
									// transform to pojos
									position: position && { x: position.x, y: position.y, z: position.z },
									rotation: rotation && { x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w },
								},
							});
						},
						updateFurnitureId: async (id, furnitureId) => {
							await localChange({
								type: 'updateFurniture',
								layoutId: getLayoutId(),
								data: {
									id,
									furnitureId,
								},
							});
						},
						deleteFurniture: async (id) => {
							await localChange({
								type: 'removeFurniture',
								layoutId: getLayoutId(),
								id,
							});
						},

						addLight: async (init) => {
							const placementId = id('lp');
							const placement = {
								id: placementId,
								...init,
							};
							await localChange({
								type: 'addLight',
								data: placement,
							});
							return placementId;
						},
						moveLight: async (id, { position }) => {
							await localChange({
								type: 'updateLight',
								data: {
									id,
									position,
								},
							});
						},
						deleteLight: async (id) => {
							await localChange({
								type: 'removeLight',
								id,
							});
						},
						updateGlobalLighting: async (update, options) => {
							await localChange(
								{
									type: 'updateGlobalLighting',
									data: update,
								},
								options
							);
						},
					} satisfies RoomStoreState;
				})
			),
			{
				name: `room-${roomId}`,
				version: ROOM_STATE_VERSION,
				partialize(state) {
					const { id, version, layouts, lights, globalLighting, operationBacklog: messageBacklog, planes, editor } = state;
					return {
						id,
						version,
						layouts,
						lights,
						globalLighting,
						messageBacklog,
						planes,
						editor: {
							// only preserve selected layout
							placingFurnitureId: null,
							selectedObjectId: null,
							selectedLayoutId: editor.selectedLayoutId,
						},
					};
				},
				migrate(persistedState: any) {
					return {
						editor: persistedState?.editor ?? { selectedLayoutId: null, selectedObjectId: null, placingFurnitureId: null },
						messageBacklog: [],
						viewingLayoutId: persistedState?.viewingLayoutId,
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
