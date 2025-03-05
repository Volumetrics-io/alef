import { useVibrateOnHover } from '@/hooks/useVibrateOnHover';
import { DragController } from '@/physics/DragController';
import { isPlaneUserData } from '@/physics/planeUserData';
import { useEditorStore, useIntersectingPlaneLabels } from '@/stores/editorStore';
import { isPrefixedId, PrefixedId } from '@alef/common';
import type { RigidBody as RRigidBody } from '@dimforge/rapier3d-compat';
import { ActiveCollisionTypes } from '@dimforge/rapier3d-compat';
import { HandleOptions, TransformHandlesProperties } from '@react-three/handle';
import { IntersectionEnterPayload, IntersectionExitPayload, RigidBodyProps, RoundCuboidColliderProps, useRapier } from '@react-three/rapier';
import { RefObject, useCallback, useEffect, useRef } from 'react';
import { Group } from 'three';
import { useShallow } from 'zustand/react/shallow';
import { useRoomStoreContext } from '../Provider';
import { useRoomStore, useRoomStoreSubscribe } from '../roomStore';

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
