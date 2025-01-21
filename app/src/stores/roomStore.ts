import { PlaneLabel } from '@/components/xr/anchors';
import { id, PrefixedId } from '@alef/common';
import type { RigidBody as RRigidBody } from '@dimforge/rapier3d-compat';
import { KinematicCharacterController } from '@dimforge/rapier3d-compat';
import { TransformHandlesProperties } from '@react-three/handle';
import { useRapier } from '@react-three/rapier';
import * as O from 'optics-ts';
import { useCallback, useEffect, useRef } from 'react';
import { Object3D, Quaternion, Vector3 } from 'three';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { useEditorStore } from './editorStore';

export interface FurniturePlacement {
	furnitureId: PrefixedId<'f'>;
	worldPosition: Vector3;
	// these are metadata useful for potential future heuristics,
	// like correcting world position to re-align with the anchor
	// used for the original placement.
	anchorLabel?: PlaneLabel;
	anchorOffset?: number;
}

export type RoomStoreState = {
	furniture: Record<string, FurniturePlacement>;

	addFurniture: (init: FurniturePlacement) => void;
	moveFurniture: (id: PrefixedId<'fp'>, position: Vector3) => void;
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
				moveFurniture: (id, position) => {
					set(O.modify(O.optic<RoomStoreState>().prop('furniture').prop(id).prop('worldPosition'))(() => position));
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

export function useSubscribeToPlacementPosition(id: PrefixedId<'fp'>, callback: (position: Vector3) => void) {
	return useRoomStore.subscribe(
		(s) => s.furniture[id],
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

export function useUpdatePlacementPosition(id: PrefixedId<'fp'>) {
	const set = useRoomStore((s) => s.moveFurniture);
	return useCallback((position: Vector3) => set(id, position), [id, set]);
}

type HandleState = Parameters<NonNullable<TransformHandlesProperties['apply']>>[0];

export function useFurniturePlacementDrag(id: PrefixedId<'fp'>) {
	const rigidBodyRef = useRef<RRigidBody>(null);
	const isDraggingRef = useRef<boolean>(false);
	const updatePosition = useUpdatePlacementPosition(id);
	const deltaRef = useRef<Vector3>(new Vector3());
	const translationRef = useRef<Vector3>(new Vector3());
	const rotationRef = useRef<Quaternion>(new Quaternion());
	const rotationDeltaRef = useRef<Quaternion>(new Quaternion());
	const prevRotationRef = useRef<Quaternion>(new Quaternion());

	const selectedFurniturePlacementId = useEditorStore((s) => s.selectedFurniturePlacementId);

	const controllerRef = useRef<KinematicCharacterController | null>(null);
	const { world } = useRapier();

	// initialize controller. use maximally permissive sliding
	// so that the user can drag the object around along walls and floors
	// of all angles.
	useEffect(() => {
		const controller = world.createCharacterController(0.1);
		controller.setMaxSlopeClimbAngle(Math.PI * 2);
		controller.setSlideEnabled(true);
		controller.disableSnapToGround();
		controllerRef.current = controller;
	}, [world]);

	// setup rigid body position subscription. position will not be set
	// if the user is in the middle of dragging
	useSubscribeToPlacementPosition(id, (pos) => {
		if (!isDraggingRef.current) {
			console.log('update position', pos);
			rigidBodyRef.current?.setNextKinematicTranslation(pos);
		}
	});

	const apply = useCallback(
		(state: HandleState, _target: Object3D) => {
			// don't bother if dependencies aren't ready
			if (!rigidBodyRef.current || !controllerRef.current) return;
			const body = rigidBodyRef.current;
			const controller = controllerRef.current;
			const collider = body.collider(0);

			// set flag to prevent external updates to position
			if (state.first) {
				isDraggingRef.current = true;
				console.debug('start dragging');
			}

			// if a delta is available, apply it to the kinematic controller, and then
			// use the computed movement to update the rigid body.
			if (state.delta && state.previous) {
				deltaRef.current.subVectors(state.current.position, state.previous.position || state.current.position);
				controller.computeColliderMovement(collider, deltaRef.current);
				// TODO: won't be necessary once https://github.com/pmndrs/xr/issues/383 is fixed
				translationRef.current.copy(body.translation());
				translationRef.current.add(controller.computedMovement());
				body.setNextKinematicTranslation(translationRef.current);

				// apply rotation

				// TODO: won't be necessary once https://github.com/pmndrs/xr/issues/383 is fixed
				rotationRef.current.copy(body.rotation());
				prevRotationRef.current.setFromEuler(state.previous.rotation);
				rotationDeltaRef.current.setFromEuler(state.current.rotation).invert().premultiply(prevRotationRef.current).invert();

				// apply rotation to the controller
				rotationRef.current.premultiply(rotationDeltaRef.current);
				body.setNextKinematicRotation(rotationRef.current);
			}

			// clear flag when dragging is done and update the position in the store
			if (state.last) {
				// allocation isn't so bad since this happens once per gesture.
				const finalPosition = new Vector3().copy(body.translation());
				console.debug('end dragging', finalPosition);
				isDraggingRef.current = false;
				updatePosition(finalPosition);
			}
		},
		[updatePosition]
	);

	return {
		handleProps: {
			apply,
			scale: false,
			rotate: { x: false, y: true, z: false },
			// only enable controls when selected
			enabled: selectedFurniturePlacementId === id,
		},
		rigidBodyRef,
	};
}
