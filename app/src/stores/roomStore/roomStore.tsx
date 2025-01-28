import { PlaneLabel } from '@/components/xr/anchors';
import { useVibrateOnHover } from '@/hooks/useVibrateOnHover';
import { DragController } from '@/physics/DragController';
import { isPlaneUserData } from '@/physics/planeUserData';
import { id, isPrefixedId, PrefixedId } from '@alef/common';
import type { RigidBody as RRigidBody } from '@dimforge/rapier3d-compat';
import { ActiveCollisionTypes } from '@dimforge/rapier3d-compat';
import { HandleOptions, TransformHandlesProperties } from '@react-three/handle';
import { IntersectionEnterPayload, IntersectionExitPayload, RigidBodyProps, RoundCuboidColliderProps, useRapier } from '@react-three/rapier';
import * as O from 'optics-ts';
import { RefObject, useCallback, useEffect, useRef } from 'react';
import { Group } from 'three';
import { createStore, useStore } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { useEditorStore, useIntersectingPlaneLabels } from '../editorStore';
import { getRoomStoreStorageKey } from './meta';
import { useRoomStoreContext } from './Provider';

export interface FurniturePlacement {
	furnitureId: PrefixedId<'f'>;
	worldPosition: { x: number; y: number; z: number };
	rotation: { x: number; y: number; z: number; w: number };
	// these are metadata useful for potential future heuristics,
	// like correcting world position to re-align with the anchor
	// used for the original placement.
	anchorLabel?: PlaneLabel;
	anchorOffset?: number;
}

export interface LightPlacement {
	worldPosition: { x: number; y: number; z: number };
}

export interface GlobalLighting {
	intensity: number;
	color: number;
}

export type RoomStoreState = {
	id: PrefixedId<'rl'>;
	furniture: Record<PrefixedId<'fp'>, FurniturePlacement>;
	lights: Record<PrefixedId<'lp'>, LightPlacement>;
	globalLighting: GlobalLighting;

	// furniture APIs
	addFurniture: (init: FurniturePlacement) => string;
	moveFurniture: (
		id: PrefixedId<'fp'>,
		transform: {
			position?: { x: number; y: number; z: number };
			rotation?: { x: number; y: number; z: number; w: number };
		}
	) => void;
	deleteFurniture: (id: PrefixedId<'fp'>) => void;

	// light APIs
	addLight: (init: LightPlacement) => string;
	moveLight: (
		id: PrefixedId<'lp'>,
		transform: {
			position?: { x: number; y: number; z: number };
		}
	) => void;
	deleteLight: (id: PrefixedId<'lp'>) => void;
	updateGlobalLighting: (update: Partial<GlobalLighting>) => void;
};

export const makeRoomStore = (roomLayoutId: PrefixedId<'rl'>) =>
	createStore<RoomStoreState>()(
		// temporary - persist store to localStorage
		persist(
			subscribeWithSelector((set) => {
				return {
					id: roomLayoutId,
					furniture: {},
					addFurniture: (init: FurniturePlacement) => {
						const placementId = id('fp');
						set(O.modify(O.optic<RoomStoreState>().prop('furniture'))((s) => ({ ...s, [placementId]: init })));
						return placementId;
					},
					moveFurniture: (
						id,
						{
							position,
							rotation,
						}: {
							position?: { x: number; y: number; z: number };
							rotation?: { x: number; y: number; z: number; w: number };
						}
					) => {
						if (position) {
							set(O.modify(O.optic<RoomStoreState>().prop('furniture').prop(id).prop('worldPosition'))(() => position));
						}
						if (rotation) {
							set(O.modify(O.optic<RoomStoreState>().prop('furniture').prop(id).prop('rotation'))(() => rotation));
						}
					},
					deleteFurniture: (id) => {
						set(
							O.modify(O.optic<RoomStoreState>().prop('furniture'))((s) => {
								const { [id]: _, ...rest } = s;
								return rest;
							})
						);
					},

					lights: {},
					globalLighting: {
						intensity: 0.8,
						color: 2.7,
					},

					addLight: (init: LightPlacement) => {
						const placementId = id('lp');
						set(O.modify(O.optic<RoomStoreState>().prop('lights'))((s) => ({ ...s, [placementId]: init })));
						return placementId;
					},
					moveLight: (
						id,
						{
							position,
						}: {
							position?: { x: number; y: number; z: number };
						}
					) => {
						if (position) {
							set(O.modify(O.optic<RoomStoreState>().prop('lights').prop(id).prop('worldPosition'))(() => position));
						}
					},
					deleteLight: (id) => {
						set(
							O.modify(O.optic<RoomStoreState>().prop('lights'))((s) => {
								const { [id]: _, ...rest } = s;
								return rest;
							})
						);
					},
					updateGlobalLighting: (update) => {
						set(O.modify(O.optic<RoomStoreState>().prop('globalLighting'))((s) => ({ ...s, ...update })));
					},
				};
			}),
			{
				name: getRoomStoreStorageKey(roomLayoutId),
				partialize: (state) => ({
					furniture: state.furniture,
					lights: state.lights,
					globalLighting: state.globalLighting,
				}),
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
	return useRoomStore(useShallow((s) => Object.keys(s.furniture) as PrefixedId<'fp'>[]));
}

export function useFurniturePlacement(id: PrefixedId<'fp'>) {
	return useRoomStore((s) => s.furniture[id]);
}

export function useDeleteFurniturePlacement(id: PrefixedId<'fp'>) {
	const deleteFn = useRoomStore((s) => s.deleteFurniture);
	return useCallback(() => {
		deleteFn(id);
	}, [deleteFn, id]);
}

export function useFurniturePlacementFurnitureId(id: PrefixedId<'fp'>) {
	return useRoomStore((s) => s.furniture[id]?.furnitureId);
}

export function useAddFurniture() {
	return useRoomStore((s) => s.addFurniture);
}

export function useSubscribeToPlacementPosition(id: PrefixedId<'fp'> | PrefixedId<'lp'>, callback: (position: { x: number; y: number; z: number }) => void) {
	useRoomStoreSubscribe(
		(s) => (isPrefixedId(id, 'fp') ? s.furniture[id] : s.lights[id]),
		(placement) => {
			if (placement) {
				callback(placement.worldPosition);
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
	return useRoomStore(useShallow((s) => Object.keys(s.lights) as PrefixedId<'lp'>[]));
}

export function useLightPlacement(id: PrefixedId<'lp'>) {
	return useRoomStore((s) => s.lights[id]);
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
