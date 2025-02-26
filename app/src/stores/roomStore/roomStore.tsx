import { useVibrateOnHover } from '@/hooks/useVibrateOnHover';
import { DragController } from '@/physics/DragController';
import { isPlaneUserData } from '@/physics/planeUserData';
import { PropertySocket } from '@/services/publicApi/socket';
import {
	getUndo,
	id,
	isPrefixedId,
	Operation,
	PrefixedId,
	RoomFurniturePlacement,
	RoomGlobalLighting,
	RoomLayout,
	RoomLightPlacement,
	RoomState,
	RoomWallData,
	updateRoom,
} from '@alef/common';
import type { RigidBody as RRigidBody } from '@dimforge/rapier3d-compat';
import { ActiveCollisionTypes } from '@dimforge/rapier3d-compat';
import { HandleOptions, TransformHandlesProperties } from '@react-three/handle';
import { IntersectionEnterPayload, IntersectionExitPayload, RigidBodyProps, RoundCuboidColliderProps, useRapier } from '@react-three/rapier';
import { RefObject, useCallback, useEffect, useRef } from 'react';
import { Group } from 'three';
import { createStore, useStore } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useShallow } from 'zustand/react/shallow';
import { useEditorStore, useIntersectingPlaneLabels } from '../editorStore';
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
	updateWalls: (walls: RoomWallData[]) => void;
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

					async function applyChange(op: Operation, { historyStack = 'undoStack' }: { historyStack?: 'undoStack' | 'redoStack' } = {}): Promise<void> {
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
								state.redoStack = [];
							});
						} else {
							try {
								await socket.request({
									type: 'applyOperations',
									operations: [op],
								});
								set((state) => {
									state.redoStack = [];
								});
							} catch (e) {
								if (e instanceof Error && e.message === 'Request timed out') {
									set((state) => {
										state.operationBacklog.push(op);
										state.redoStack = [];
									});
								}
							}
						}
					}

					return {
						id: roomId,
						operationBacklog: [],
						undoStack: [],
						redoStack: [],
						viewingLayoutId: undefined,
						walls: [],
						layouts: {},
						lights: {},
						globalLighting: {
							intensity: 1.5,
							color: 6.3,
						},

						undo: () => {
							const undo = get().undoStack.pop();
							if (undo) {
								applyChange(undo, { historyStack: 'redoStack' });
							}
						},
						redo: () => {
							const redo = get().redoStack.pop();
							if (redo) {
								applyChange(redo, { historyStack: 'undoStack' });
							}
						},

						updateWalls: async (walls) => {
							await applyChange({
								type: 'updateWalls',
								roomId,
								walls,
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
				partialize(state) {
					const { id, layouts, lights, globalLighting, operationBacklog: messageBacklog, walls, viewingLayoutId } = state;
					return {
						id,
						layouts,
						lights,
						globalLighting,
						messageBacklog,
						walls,
						viewingLayoutId,
					};
				},
			}
		)
	);
export type RoomStore = ReturnType<typeof makeRoomStore>;

function useRoomStore<T>(selector: (s: RoomStoreState) => T) {
	const store = useRoomStoreContext();
	return useStore(store, selector);
}

function useRoomStoreSubscribe<T>(selector: (s: RoomStoreState) => T, listener: (state: T) => void, options?: { fireImmediately?: boolean; equalityFn?: (a: T, b: T) => boolean }) {
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

export function useFurniturePlacementIds() {
	return useRoomStore(useShallow((s) => Object.keys(s.viewingLayoutId ? s.layouts[s.viewingLayoutId]?.furniture : {}) as PrefixedId<'fp'>[]));
}

export function useFurniturePlacement(id: PrefixedId<'fp'>) {
	return useRoomStore((s) => (s.viewingLayoutId ? (s.layouts[s.viewingLayoutId]?.furniture[id] ?? null) : null));
}

export function useDeleteFurniturePlacement(id: PrefixedId<'fp'>) {
	const deleteFn = useRoomStore((s) => s.deleteFurniture);
	return useCallback(() => {
		deleteFn(id);
	}, [deleteFn, id]);
}

export function useFurniturePlacementFurnitureId(id: PrefixedId<'fp'>) {
	return useRoomStore((s) => (s.viewingLayoutId ? (s.layouts[s.viewingLayoutId].furniture[id]?.furnitureId ?? null) : null));
}

export function useSetFurniturePlacementFurnitureId() {
	return useRoomStore((s) => s.updateFurnitureId);
}

export function useAddFurniture() {
	return useRoomStore((s) => s.addFurniture);
}

export function useSubscribeToPlacementPosition(id: PrefixedId<'fp'> | PrefixedId<'lp'>, callback: (position: { x: number; y: number; z: number }) => void) {
	useRoomStoreSubscribe(
		(s) => (s.viewingLayoutId ? (isPrefixedId(id, 'fp') ? (s.layouts[s.viewingLayoutId]?.furniture[id] ?? null) : (s.lights[id] ?? null)) : null),
		(placement) => {
			if (placement) {
				callback(placement.position);
			}
		},
		{
			fireImmediately: true,
		}
	);
}

export function useUpdateFurniturePlacementTransform(id: PrefixedId<'fp'>) {
	const set = useRoomStore((s) => s.moveFurniture);
	return useCallback((transform: { position?: { x: number; y: number; z: number }; rotation?: { x: number; y: number; z: number; w: number } }) => set(id, transform), [id, set]);
}

type HandleState = Parameters<NonNullable<TransformHandlesProperties['apply']>>[0];

export function useFurniturePlacementDrag(id: PrefixedId<'fp'>) {
	const groupRef = useRef<Group>(null);
	const rigidBodyRef = useRef<RRigidBody>(null);
	const updatePosition = useUpdateFurniturePlacementTransform(id);

	const updateIntersectionEnter = useEditorStore((s) => s.onIntersectionEnter);
	const updateIntersectionExit = useEditorStore((s) => s.onIntersectionExit);
	// which plane types are we contacting?
	const snappedTo = useIntersectingPlaneLabels(id);
	// const snappedTo = [] as string[];
	const isOnFloor = snappedTo.some((plane) => plane === 'floor');

	const controllerRef = useRef<DragController | null>(null);
	const { world } = useRapier();

	const store = useRoomStoreContext();

	useEffect(() => {
		console.debug('new drag controller', id);
		controllerRef.current = new DragController(id, world, rigidBodyRef, store, {
			onDragEnd: updatePosition,
		});
		return () => {
			console.debug('destroy drag controller', id);
			controllerRef.current?.dispose();
		};
	}, [world, updatePosition, id, store]);

	const apply = useCallback((state: HandleState) => {
		controllerRef.current?.update(state);
	}, []);

	const onIntersectionEnter = useCallback(
		(intersection: IntersectionEnterPayload) => {
			const userData = intersection.rigidBody?.userData;
			if (isPlaneUserData(userData)) {
				updateIntersectionEnter(id, userData.planeId);
			}
		},
		[id, updateIntersectionEnter]
	);

	const onIntersectionExit = useCallback(
		(intersection: IntersectionExitPayload) => {
			const userData = intersection.rigidBody?.userData;
			if (isPlaneUserData(userData)) {
				updateIntersectionExit(id, userData.planeId);
			}
		},
		[id, updateIntersectionExit]
	);

	const rotateHandleProps: HandleOptions<unknown> | null = isOnFloor
		? {
				apply,
				scale: false,
				rotate: { x: false, y: true, z: false },
				translate: 'as-rotate',
			}
		: null;

	// @ts-expect-error - idk why Group is not inheriting Object3D?
	useVibrateOnHover(groupRef);

	return {
		groupProps: {
			ref: groupRef,
		},
		dragHandleProps: {
			apply,
			scale: false,
			rotate: false,
			alwaysUpdate: true,
			translate: { x: true, y: false, z: true },
		} satisfies HandleOptions<unknown>,
		rotateHandleProps,
		rigidBodyProps: {
			ref: rigidBodyRef,
			type: 'kinematicPosition' as const,
			linearDamping: 0,
			angularDamping: 0,
			onIntersectionEnter,
			onIntersectionExit,
		} satisfies RigidBodyProps & { ref: RefObject<RRigidBody> },
		colliderProps: {
			activeCollisionTypes: ActiveCollisionTypes.KINEMATIC_FIXED,
		} satisfies Partial<RoundCuboidColliderProps>,
	};
}

export function useLightPlacementIds() {
	return useRoomStore(useShallow((s) => Object.keys(s.lights ?? {}) as PrefixedId<'lp'>[]));
}

export function useLightPlacement(id: PrefixedId<'lp'>) {
	return useRoomStore((s) => s.lights[id] ?? null);
}

export function useDeleteLightPlacement(id: PrefixedId<'lp'>) {
	const deleteFn = useRoomStore((s) => s.deleteLight);
	return useCallback(() => {
		deleteFn(id);
	}, [deleteFn, id]);
}

export function useAddLight() {
	return useRoomStore((s) => s.addLight);
}

export function useMoveLight(id: PrefixedId<'lp'>) {
	const moveFn = useRoomStore((s) => s.moveLight);
	return useCallback(
		(transform: { position?: { x: number; y: number; z: number } }) => {
			moveFn(id, transform);
		},
		[id, moveFn]
	);
}

export function useGlobalLighting() {
	const value = useRoomStore((s) => s.globalLighting);
	const update = useRoomStore((s) => s.updateGlobalLighting);
	return [value, update] as const;
}

export function useRoomLayoutIds() {
	return useRoomStore(useShallow((s) => Object.keys(s.layouts) as PrefixedId<'rl'>[]));
}

export function useRoomLayout(id: PrefixedId<'rl'>) {
	return useRoomStore((s) => s.layouts[id] ?? null);
}

export function useCreateRoomLayout() {
	return useRoomStore((s) => s.createLayout);
}

export function useActiveRoomLayoutId() {
	return useRoomStore(useShallow((s) => [s.viewingLayoutId, s.setViewingLayoutId] as const));
}

export function useActiveRoomLayout() {
	return useRoomStore((s) => (s.viewingLayoutId ? (s.layouts[s.viewingLayoutId] ?? null) : null));
}

export function useUpdateRoomLayout() {
	return useRoomStore((s) => s.updateLayout);
}

export function useDeleteRoomLayout() {
	return useRoomStore((s) => s.deleteLayout);
}

export function useHasWalls() {
	return useRoomStore((s) => s.walls.length > 0);
}

export function useUpdateWalls() {
	return useRoomStore((s) => s.updateWalls);
}
