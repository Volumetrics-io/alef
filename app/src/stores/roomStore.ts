import { PlaneLabel } from '@/components/xr/anchors';
import { useVibrateOnHover } from '@/hooks/useVibrateOnHover';
import { DragController } from '@/physics/DragController';
import { isPlaneUserData } from '@/physics/planeUserData';
import { id, PrefixedId } from '@alef/common';
import type { RigidBody as RRigidBody } from '@dimforge/rapier3d-compat';
import { ActiveCollisionTypes } from '@dimforge/rapier3d-compat';
import { HandleOptions, TransformHandlesProperties } from '@react-three/handle';
import { IntersectionEnterPayload, IntersectionExitPayload, RigidBodyProps, RoundCuboidColliderProps, useRapier } from '@react-three/rapier';
import * as O from 'optics-ts';
import { RefObject, useCallback, useEffect, useRef } from 'react';
import { Group } from 'three';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { useEditorStore, useIntersectingPlaneLabels } from './editorStore';

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

export type RoomStoreState = {
	furniture: Record<string, FurniturePlacement>;

	addFurniture: (init: FurniturePlacement) => void;
	moveFurniture: (
		id: PrefixedId<'fp'>,
		transform: {
			position?: { x: number; y: number; z: number };
			rotation?: { x: number; y: number; z: number; w: number };
		}
	) => void;
	deleteFurniture: (id: PrefixedId<'fp'>) => void;
};

export const useRoomStore = create<RoomStoreState>()(
	// temporary - persist store to localStorage
	persist(
		subscribeWithSelector((set) => {
			return {
				furniture: {},
				addFurniture: (init: FurniturePlacement) => {
					const placementId = id('fp');
					set(O.modify(O.optic<RoomStoreState>().prop('furniture'))((s) => ({ ...s, [placementId]: init })));
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
			};
		}),
		{
			name: 'testing-roomstore',
			partialize: (state) => ({
				furniture: state.furniture,
			}),
		}
	)
);

(window as any).roomStore = useRoomStore;

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

export function useSubscribeToPlacementPosition(id: PrefixedId<'fp'>, callback: (position: { x: number; y: number; z: number }) => void) {
	const stableCallback = useRef(callback);
	stableCallback.current = callback;
	return useEffect(
		() =>
			useRoomStore.subscribe(
				(s) => s.furniture[id],
				(placement) => {
					if (placement) {
						stableCallback.current(placement.worldPosition);
					}
				},
				{
					fireImmediately: true,
				}
			),
		[id]
	);
}

export function useSubscribeToPlacementRotation(id: PrefixedId<'fp'>, callback: (rotation: { x: number; y: number; z: number; w: number }) => void) {
	const stableCallback = useRef(callback);
	stableCallback.current = callback;
	return useEffect(
		() =>
			useRoomStore.subscribe(
				(s) => s.furniture[id],
				(placement) => {
					if (placement) {
						stableCallback.current(placement.rotation);
					}
				},
				{
					fireImmediately: true,
				}
			),
		[id]
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

	useEffect(() => {
		console.debug('new drag controller', id);
		controllerRef.current = new DragController(id, world, rigidBodyRef, {
			onDragEnd: updatePosition,
		});
	}, [world, updatePosition, id]);

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
