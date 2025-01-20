import { PlaneLabel } from '@/components/xr/anchors';
import { id, PrefixedId } from '@alef/common';
import type { RigidBody as RRigidBody } from '@dimforge/rapier3d-compat';
import { KinematicCharacterController, World } from '@dimforge/rapier3d-compat';
import { ThreeEvent } from '@react-three/fiber';
import { useRapier } from '@react-three/rapier';
import * as O from 'optics-ts';
import { useCallback, useEffect, useRef } from 'react';
import { Group, Object3D, Vector3 } from 'three';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

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
	furnitureControllers: Record<string, KinematicCharacterController | null>;

	addFurniture: (init: FurniturePlacement) => void;
	moveFurniture: (id: PrefixedId<'fp'>, position: Vector3) => void;

	registerFurnitureController: (id: PrefixedId<'fp'>, world: World) => { controller: KinematicCharacterController; cleanup: () => void };
};

export const useRoomStore = create<RoomStoreState>()(
	// temporary - persist store to localStorage
	persist(
		subscribeWithSelector((set) => {
			return {
				furniture: {},
				furnitureControllers: {},
				addFurniture: (init: FurniturePlacement) => {
					const placementId = id('fp');
					set(O.modify(O.optic<RoomStoreState>().prop('furniture'))((s) => ({ ...s, [placementId]: init })));
				},
				moveFurniture: (id, position) => {
					set(O.modify(O.optic<RoomStoreState>().prop('furniture').prop(id).prop('worldPosition'))(() => position));
				},
				registerFurnitureController: (id, world) => {
					const controller = world.createCharacterController(0.1);

					set(O.modify(O.optic<RoomStoreState>().prop('furnitureControllers'))((s) => ({ ...s, [id]: controller })));
					const cleanup = () => {
						world.removeCharacterController(controller);
						controller.free();
						set(O.modify(O.optic<RoomStoreState>().prop('furnitureControllers'))((s) => ({ ...s, [id]: null })));
					};
					return { controller, cleanup };
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

export function useFurniturePlacementDrag(id: PrefixedId<'fp'>) {
	const updatePosition = useUpdatePlacementPosition(id);

	const groupRef = useRef<Group>(null);
	const rigidBodyRef = useRef<RRigidBody>(null);
	const isDraggingRef = useRef<boolean>(false);
	const lastPointerPosition = useRef<Vector3>(new Vector3());
	const worldPosition = useRef<Vector3>(new Vector3());

	const currentPointerPositionRef = useRef(new Vector3());
	const deltaRef = useRef(new Vector3());

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
			rigidBodyRef.current?.setNextKinematicTranslation(pos);
		}
	});

	const handlePointerMove = useCallback((event: ThreeEvent<PointerEvent>) => {
		/**
		 * ADAPTATION NOTE
		 *
		 * original code converted position to local space of the parent, but
		 * with the rigidbody we are dealing in the world space of the simulation.
		 */

		if (isDraggingRef.current && lastPointerPosition.current) {
			if (!groupRef.current || !groupRef.current.parent || !rigidBodyRef.current || !controllerRef.current) {
				console.log('pointer move early return', {
					groupRef: groupRef.current,
					rigidBodyRef: rigidBodyRef.current,
					controllerRef: controllerRef.current,
				});
				return;
			}
			const currentPointerPosition = currentPointerPositionRef.current;
			const delta = deltaRef.current;
			// @ts-expect-error NOTE: This does exist on the event object
			currentPointerPosition.copy(event.pointerPosition);
			delta.subVectors(currentPointerPosition, lastPointerPosition.current);
			lastPointerPosition.current.copy(currentPointerPosition);

			// copy world position of body into the vector
			worldPosition.current.copy(rigidBodyRef.current.translation());
			// Calculate distance from initial position
			const distanceFromStart = Math.abs(worldPosition.current.distanceTo(currentPointerPosition));

			// Scale factor increases with distance (adjust multiplier as needed)
			const scaleFactor = 1 + distanceFromStart * 5;
			delta.multiplyScalar(scaleFactor);

			// calculate corrected delta
			controllerRef.current.computeColliderMovement(rigidBodyRef.current.collider(0), delta);
			delta.copy(controllerRef.current.computedMovement());
			// add the corrected delta
			worldPosition.current.add(delta);
			// set the new position of the rigidbody
			rigidBodyRef.current.setNextKinematicTranslation(worldPosition.current);
		}
	}, []);

	const handlePointerUp = useCallback(() => {
		console.log('pointer up');
		isDraggingRef.current = false;
		lastPointerPosition.current.set(0, 0, 0);
		updatePosition(worldPosition.current);
	}, [updatePosition]);

	const handlePointerCancel = useCallback(() => {
		isDraggingRef.current = false;
		lastPointerPosition.current.set(0, 0, 0);
	}, []);

	const handlePointerDown = useCallback((event: ThreeEvent<PointerEvent>) => {
		isDraggingRef.current = true;
		// @ts-expect-error NOTE: This does exist on the event object
		lastPointerPosition.current.copy(event.pointerPosition);
		console.log('pointer down');
		// IDK why TS doesn't see Group as a subclass of Object3D.
		(groupRef.current as unknown as Object3D).setPointerCapture(event.pointerId);
	}, []);

	return {
		handleProps: {
			onPointerMove: handlePointerMove,
			onPointerUp: handlePointerUp,
			onPointerCancel: handlePointerCancel,
			onPointerDown: handlePointerDown,
			ref: groupRef,
		},
		rigidBodyRef,
	};
}
