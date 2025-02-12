import { useVibrateOnHover } from '@/hooks/useVibrateOnHover';
import { DragController } from '@/physics/DragController';
import { isPlaneUserData } from '@/physics/planeUserData';
import { PropertySocket } from '@/services/publicApi/socket';
import { id, isPrefixedId, PrefixedId, RoomFurniturePlacement, RoomGlobalLighting, RoomLayout, RoomLightPlacement, RoomState } from '@alef/common';
import type { RigidBody as RRigidBody } from '@dimforge/rapier3d-compat';
import { ActiveCollisionTypes } from '@dimforge/rapier3d-compat';
import { HandleOptions, TransformHandlesProperties } from '@react-three/handle';
import { IntersectionEnterPayload, IntersectionExitPayload, RigidBodyProps, RoundCuboidColliderProps, useRapier } from '@react-three/rapier';
import { RefObject, useCallback, useEffect, useRef } from 'react';
import { Group } from 'three';
import { createStore, useStore } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useShallow } from 'zustand/react/shallow';
import { useEditorStore, useIntersectingPlaneLabels } from '../editorStore';
import { useRoomStoreContext } from './Provider';

export type RoomStoreState = RoomState & {
	// client state
	viewingLayoutId?: PrefixedId<'rl'>;

	/**
	 * Creates an empty new room layout and sets it as the current layout
	 */
	createLayout: (data?: { name?: string }) => Promise<void>;
	setViewingLayoutId: (id: PrefixedId<'rl'>) => void;
	updateLayout: (data: Pick<RoomLayout, 'id' | 'name' | 'icon'>) => void;

	// furniture APIs
	addFurniture: (init: Omit<RoomFurniturePlacement, 'id'>) => Promise<string>;
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

export const makeRoomStore = (socket: PropertySocket, roomId: PrefixedId<'r'>) =>
	createStore<RoomStoreState>()(
		immer(
			subscribeWithSelector((set, get): RoomStoreState => {
				// request initial layout state and load into store on creation
				socket
					.request(
						{
							type: 'requestRoom',
							roomId,
						},
						'roomUpdate'
					)
					.then((response) => {
						set({
							...response.data,
							// pick an arbitrary layout to view
							viewingLayoutId: Object.keys(response.data.layouts)[0] as PrefixedId<'rl'> | undefined,
						});
					});

				function getLayoutId() {
					const id = get().viewingLayoutId;
					if (!id) {
						throw new Error('No layout selected');
					}
					return id;
				}

				function updateLayout(updater: (v: RoomLayout) => void) {
					const layoutId = getLayoutId();
					set((state) => {
						const layout = state.layouts[layoutId];
						if (!layout) {
							throw new Error(`Cannot update layout ${layoutId}; not found`);
						}
						updater(layout);
					});
				}

				return {
					id: roomId,
					viewingLayoutId: undefined,
					walls: [],
					layouts: {},
					globalLighting: {
						intensity: 0.8,
						color: 2.7,
					},

					createLayout: async (data) => {
						const name = data?.name || `Layout ${Object.keys(get().layouts).length + 1}`;
						// creates the layout on the server first. this will supply
						// default values.
						const response = await socket.request(
							{
								type: 'createLayout',
								roomId,
								data: { name },
							},
							'layoutCreated'
						);
						set((state) => {
							state.layouts[response.data.id] = response.data;
							state.viewingLayoutId = response.data.id;
						});
					},
					setViewingLayoutId(id) {
						set({ viewingLayoutId: id });
					},
					updateLayout: async (data) => {
						set((state) => {
							const layout = state.layouts[data.id];
							if (!layout) {
								throw new Error(`Cannot update layout ${data.id}; not found`);
							}
							if (data.name) {
								layout.name = data.name;
							}
							if (data.icon) {
								layout.icon ??= data.icon;
							}
						});
						await socket.request({
							type: 'updateRoomLayout',
							roomId,
							data,
						});
					},

					addFurniture: async (init) => {
						const placementId = id('fp');
						const layoutId = getLayoutId();
						const placement = {
							id: placementId,
							...init,
						};

						await socket.request({
							type: 'addFurniture',
							roomId,
							roomLayoutId: layoutId,
							data: placement,
						});

						updateLayout((cur) => {
							cur.furniture[placement.id] = placement;
						});

						return placementId;
					},
					moveFurniture: async (id, { position, rotation }) => {
						await socket.request({
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
						updateLayout((layout) => {
							const furniture = layout.furniture[id];
							if (!furniture) {
								throw new Error(`Cannot move furniture ${id}; not found`);
							}
							if (position) {
								furniture.position = position;
							}
							if (rotation) {
								furniture.rotation = rotation;
							}
						});
					},
					deleteFurniture: async (id) => {
						await socket.request({
							type: 'removeFurniture',
							roomId,
							roomLayoutId: getLayoutId(),
							id,
						});
						updateLayout((layout) => {
							delete layout.furniture[id];
						});
					},

					addLight: async (init) => {
						const placementId = id('lp');
						const layoutId = getLayoutId();
						const placement = {
							id: placementId,
							...init,
						};
						await socket.request({
							type: 'addLight',
							roomId,
							roomLayoutId: layoutId,
							data: placement,
						});
						updateLayout((layout) => {
							layout.lights[placement.id] = placement;
						});
						return placementId;
					},
					moveLight: async (id, { position }) => {
						await socket.request({
							type: 'updateLight',
							roomId,
							roomLayoutId: getLayoutId(),
							data: {
								id,
								position,
							},
						});
						updateLayout((layout) => {
							const light = layout.lights[id];
							if (!light) {
								throw new Error(`Cannot move light ${id}; not found`);
							}
							if (position) {
								light.position = position;
							}
						});
					},
					deleteLight: async (id) => {
						await socket.request({
							type: 'removeLight',
							roomId,
							roomLayoutId: getLayoutId(),
							id,
						});
						updateLayout((layout) => {
							delete layout.lights[id];
						});
					},
					updateGlobalLighting: async (update) => {
						await socket.request({
							type: 'updateGlobalLighting',
							roomId,
							data: update,
						});
						set((state) => {
							state.globalLighting = { ...state.globalLighting, ...update };
						});
					},
				} satisfies RoomStoreState;
			})
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

export function useAddFurniture() {
	return useRoomStore((s) => s.addFurniture);
}

export function useSubscribeToPlacementPosition(id: PrefixedId<'fp'> | PrefixedId<'lp'>, callback: (position: { x: number; y: number; z: number }) => void) {
	useRoomStoreSubscribe(
		(s) => (s.viewingLayoutId ? (isPrefixedId(id, 'fp') ? (s.layouts[s.viewingLayoutId]?.furniture[id] ?? null) : (s.layouts[s.viewingLayoutId]?.lights[id] ?? null)) : null),
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
	return useRoomStore(useShallow((s) => (s.viewingLayoutId ? (Object.keys(s.layouts[s.viewingLayoutId]?.lights ?? {}) as PrefixedId<'lp'>[]) : [])));
}

export function useLightPlacement(id: PrefixedId<'lp'>) {
	return useRoomStore((s) => (s.viewingLayoutId ? (s.layouts[s.viewingLayoutId]?.lights[id] ?? null) : null));
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

export function useUpdateRoomLayout() {
	return useRoomStore((s) => s.updateLayout);
}
