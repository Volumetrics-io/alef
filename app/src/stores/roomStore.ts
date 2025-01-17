import { PlaneLabel } from '@/components/xr/anchors';
import { id, PrefixedId } from '@alef/common';
import { KinematicCharacterController, RigidBody, World } from '@dimforge/rapier3d-compat';
import { ThreeEvent } from '@pmndrs/uikit';
import { useRapier, vec3 } from '@react-three/rapier';
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

export function useFurniturePlacementPosition(id: PrefixedId<'fp'>) {
	const rigidBodyRef = useRef<RigidBody>(null);
	const groupRef = useRef<Group>(null);
	const previousPositionRef = useRef<Vector3>(new Vector3());
	const currentPositionRef = useRef<Vector3>(new Vector3());
	const deltaRef = useRef<Vector3>(new Vector3());
	const initialPositionRef = useRef<Vector3>(new Vector3());
	const isDraggingRef = useRef(false);
	const moveFurniture = useRoomStore((s) => s.moveFurniture);

	useSubscribeToPlacementPosition(id, (position) => {
		// avoid clobbering in-progress drag
		if (isDraggingRef.current) {
			return;
		}

		rigidBodyRef.current?.setTranslation(vec3(position), false);
	});

	// register the character controller and set up drag handlers. the controller
	// is accessible by this furniture placement's id if other parts of the app
	// need to reference it.
	const { world } = useRapier();
	const register = useRoomStore((s) => s.registerFurnitureController);
	const controllerRef = useRef<KinematicCharacterController | null>(null);
	useEffect(() => {
		const { controller, cleanup } = register(id, world);
		controllerRef.current = controller;
		return () => {
			cleanup();
			controllerRef.current = null;
		};
	}, [id, world, register]);

	const beginDrag = useCallback((ev: ThreeEvent) => {
		if (!groupRef.current || !rigidBodyRef.current) {
			return;
		}

		isDraggingRef.current = true;
		const pointerPosition = (ev as any).pointerPosition;
		initialPositionRef.current.copy(pointerPosition);
		// IDK why TS doesn't see Group as a subclass of Object3D.
		(groupRef.current as unknown as Object3D).setPointerCapture(ev.pointerId);
	}, []);

	const commitDrag = useCallback(() => {
		if (!isDraggingRef.current || !rigidBodyRef.current) {
			console.debug('invalid drag commit');
			return;
		}
		isDraggingRef.current = false;
		const pos = new Vector3();
		pos.copy(rigidBodyRef.current.translation());
		moveFurniture(id, pos);
		console.debug('drag committed');
	}, [id, moveFurniture]);

	const translationRef = useRef(new Vector3());
	const onDrag = useCallback((ev: ThreeEvent) => {
		if (!groupRef.current || !isDraggingRef.current || !rigidBodyRef.current || !controllerRef.current) {
			return;
		}

		const pointerPosition = (ev as any).pointerPosition;
		currentPositionRef.current.copy(pointerPosition);
		deltaRef.current.subVectors(currentPositionRef.current, previousPositionRef.current);
		previousPositionRef.current.copy(currentPositionRef.current);
		const distanceFromStart = groupRef.current.position.distanceTo(initialPositionRef.current);
		const scaleFactor = 1 + distanceFromStart * 2;
		deltaRef.current.multiplyScalar(scaleFactor);

		// using the first (should be only) collider, compute allowed movement
		// within the scene when we add the delta movement to the current position.
		const collider = rigidBodyRef.current.collider(0);

		const usePhysics = true;
		if (usePhysics) {
			controllerRef.current.computeColliderMovement(collider, vec3(deltaRef.current));
			const correctedMovement = controllerRef.current.computedMovement();
			translationRef.current.copy(rigidBodyRef.current.translation());
			translationRef.current.add(correctedMovement);
		} else {
			translationRef.current.copy(groupRef.current.position);
			translationRef.current.add(deltaRef.current);
		}
		rigidBodyRef.current.setNextKinematicTranslation(translationRef.current);
	}, []);

	const cancelDrag = useCallback(() => {
		isDraggingRef.current = false;
		// force body back to original position
		const placement = useRoomStore.getState().furniture[id];
		if (placement) {
			rigidBodyRef.current?.setNextKinematicTranslation(vec3(placement.worldPosition));
		}
		console.debug('drag cancelled');
	}, [id]);

	return { beginDrag, commitDrag, onDrag, groupRef, cancelDrag, rigidBodyRef };
}
