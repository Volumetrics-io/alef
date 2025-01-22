import { PlaneLabel } from '@/components/xr/anchors';
import { id, PrefixedId } from '@alef/common';
import type { RigidBody as RRigidBody } from '@dimforge/rapier3d-compat';
import { KinematicCharacterController } from '@dimforge/rapier3d-compat';
import { PivotHandlesProperties, TransformHandlesProperties } from '@react-three/handle';
import { RigidBodyProps, useBeforePhysicsStep, useRapier } from '@react-three/rapier';
import * as O from 'optics-ts';
import { RefObject, useCallback, useEffect, useRef } from 'react';
import { Euler, Object3D, Quaternion, Vector3 } from 'three';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { useEditorStore } from './editorStore';

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
	const rigidBodyRef = useRef<RRigidBody>(null);
	const isDraggingRef = useRef<boolean>(false);
	const updatePosition = useUpdateFurniturePlacementTransform(id);
	const deltaRef = useRef<Vector3>(new Vector3());
	const rotationDeltaRef = useRef<Quaternion>(new Quaternion());

	const selectedFurniturePlacementId = useEditorStore((s) => s.selectedFurniturePlacementId);

	const controllerRef = useRef<KinematicCharacterController | null>(null);
	const { world } = useRapier();

	// initialize controller. use maximally permissive sliding
	// so that the user can drag the object around along walls and floors
	// of all angles.
	useEffect(() => {
		const controller = world.createCharacterController(0.05);
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
	useSubscribeToPlacementRotation(id, (rot) => {
		if (!isDraggingRef.current) {
			console.log('update rotation', rot);
			rigidBodyRef.current?.setNextKinematicRotation(new Quaternion(rot.x, rot.y, rot.z, rot.w));
		}
	});

	const handleStateRef = useRef<{ linear: Vector3; angular: Euler; commitNow: boolean }>({ linear: new Vector3(), angular: new Euler(), commitNow: false });

	const apply = useCallback((state: HandleState, _target: Object3D) => {
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
			// get the diff TODO: won't be necessary once https://github.com/pmndrs/xr/issues/383 is fixed
			rotationDeltaRef.current.copy(state.previous.quaternion);
			rotationDeltaRef.current.invert().premultiply(state.current.quaternion);
			handleStateRef.current.angular.setFromQuaternion(rotationDeltaRef.current, 'XYZ');

			// TODO: won't be necessary once https://github.com/pmndrs/xr/issues/383 is fixed
			deltaRef.current.subVectors(state.current.position, state.previous.position);
			controller.computeColliderMovement(collider, deltaRef.current);
			handleStateRef.current.linear.copy(controller.computedMovement());
			// since handles rotate with the object, we have to apply the object's rotation
			// to the movement vector to get it in world space.
			handleStateRef.current.linear.applyQuaternion(body.rotation());
		}

		// clear flag when dragging is done and update the position in the store
		if (state.last) {
			isDraggingRef.current = false;
			// can't actually commit yet, have to wait for frame update below
			handleStateRef.current.commitNow = true;
		}
	}, []);

	useBeforePhysicsStep(({ timestep: dt }) => {
		const { linear, angular, commitNow: committed } = handleStateRef.current;
		if (rigidBodyRef.current) {
			const body = rigidBodyRef.current;
			linear.multiplyScalar(1 / dt);
			body.setLinvel(linear, true);
			// euler doesn't have multiplyScalar :(
			angular.x *= 1 / dt;
			angular.y *= 1 / dt;
			angular.z *= 1 / dt;
			body.setAngvel(angular, true);

			if (committed) {
				// drag ended - update stored position
				updatePosition({
					position: body.translation(),
					rotation: body.rotation(),
				});
				handleStateRef.current.commitNow = false;
			}
		}
		linear.set(0, 0, 0);
		angular.set(0, 0, 0);
	});

	return {
		handleProps: {
			apply,
			scale: false,
			rotation: { x: false, y: true, z: false } as any,
			// only enable controls when selected
			enabled: selectedFurniturePlacementId === id,
		} satisfies PivotHandlesProperties,
		rigidBodyProps: {
			ref: rigidBodyRef,
			type: 'kinematicVelocity' as const,
			colliders: 'cuboid' as const,
			linearDamping: 0,
			angularDamping: 0,
		} satisfies RigidBodyProps & { ref: RefObject<RRigidBody> },
	};
}
