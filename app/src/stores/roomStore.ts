import { PlaneLabel } from '@/components/xr/anchors';
import { isXRPlaneUserData } from '@/physics/xrPlaneUserData';
import { id, PrefixedId } from '@alef/common';
import type { RigidBody as RRigidBody } from '@dimforge/rapier3d-compat';
import { KinematicCharacterController } from '@dimforge/rapier3d-compat';
import { HandleOptions, TransformHandlesProperties } from '@react-three/handle';
import { IntersectionEnterPayload, IntersectionExitPayload, RigidBodyProps, useRapier } from '@react-three/rapier';
import * as O from 'optics-ts';
import { RefObject, useCallback, useEffect, useRef } from 'react';
import { Object3D, Quaternion, Vector3 } from 'three';
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
	const rigidBodyRef = useRef<RRigidBody>(null);
	const isDraggingRef = useRef<boolean>(false);
	const updatePosition = useUpdateFurniturePlacementTransform(id);

	const updateIntersectionEnter = useEditorStore((s) => s.onIntersectionEnter);
	const updateIntersectionExit = useEditorStore((s) => s.onIntersectionExit);

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

	/**
	 * Big grab bag of allocated state vars for use during gesture handling
	 */
	const handleStateRef = useRef<{ translation: Vector3; rotation: Quaternion; rotationDelta: Quaternion; translationDelta: Vector3 }>({
		translation: new Vector3(),
		rotation: new Quaternion(),
		rotationDelta: new Quaternion(),
		translationDelta: new Vector3(),
	});

	const apply = useCallback(
		(state: HandleState, _target: Object3D) => {
			// don't bother if dependencies aren't ready
			if (!rigidBodyRef.current || !controllerRef.current) return;
			const body = rigidBodyRef.current;
			const controller = controllerRef.current;
			const collider = body.collider(0);

			const { rotation, translation, rotationDelta, translationDelta } = handleStateRef.current;

			// set flag to prevent external updates to position
			if (state.first) {
				isDraggingRef.current = true;
				console.debug('start dragging');
			}

			// if a delta is available, apply it to the kinematic controller, and then
			// use the computed movement to update the rigid body.
			if (state.delta && state.previous) {
				// get the diff TODO: won't be necessary once https://github.com/pmndrs/xr/issues/383 is fixed
				rotationDelta.copy(state.previous.quaternion);
				rotationDelta.invert().premultiply(state.current.quaternion);
				// "add" (multiply) to current rotation
				rotation.copy(body.rotation()).multiply(rotationDelta);
				body.setNextKinematicRotation(rotation);

				// get the diff TODO: won't be necessary once https://github.com/pmndrs/xr/issues/383 is fixed
				translationDelta.subVectors(state.current.position, state.previous.position);
				controller.computeColliderMovement(collider, translationDelta);
				// copy back to vector for further adjustment
				translationDelta.copy(controller.computedMovement());
				// since handles rotate with the object, we have to apply the object's rotation
				// to the movement vector to get it in world space.
				// translationDelta.applyQuaternion(rotation);
				// add adjusted delta translation
				translation.addVectors(body.translation(), translationDelta);
				body.setNextKinematicTranslation(translation);
			}

			// clear flag when dragging is done and update the position in the store
			if (state.last) {
				isDraggingRef.current = false;
				updatePosition({
					position: body.translation(),
					rotation: body.rotation(),
				});
			}
		},
		[updatePosition]
	);

	const onIntersectionEnter = useCallback(
		(intersection: IntersectionEnterPayload) => {
			const userData = intersection.rigidBody?.userData;
			if (isXRPlaneUserData(userData)) {
				console.log('intersection enter', userData.plane);
				updateIntersectionEnter(id, userData.plane);
			}
		},
		[id, updateIntersectionEnter]
	);

	const onIntersectionExit = useCallback(
		(intersection: IntersectionExitPayload) => {
			const userData = intersection.rigidBody?.userData;
			if (isXRPlaneUserData(userData)) {
				console.log('intersection exit', userData.plane);
				updateIntersectionExit(id, userData.plane);
			}
		},
		[id, updateIntersectionExit]
	);

	return {
		dragHandleProps: {
			apply,
			scale: false,
			rotate: { x: false, y: true, z: false } as any,
		} satisfies HandleOptions<unknown>,
		rotateHandleProps: {} satisfies HandleOptions<unknown>,
		rigidBodyProps: {
			ref: rigidBodyRef,
			type: 'kinematicPosition' as const,
			linearDamping: 0,
			angularDamping: 0,
			onIntersectionEnter,
			onIntersectionExit,
		} satisfies RigidBodyProps & { ref: RefObject<RRigidBody> },
	};
}
