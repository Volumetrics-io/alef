import { PlaneLabel } from '@/components/xr/anchors';
import { getClosestPointOnXRPlane, getMostIntentionalPlaneSnappedMovement, getXRPlaneCenterAndNormal } from '@/physics/xrPlaneTools';
import { isXRPlaneUserData } from '@/physics/xrPlaneUserData';
import { id, PrefixedId } from '@alef/common';
import type { RigidBody as RRigidBody } from '@dimforge/rapier3d-compat';
import { ActiveCollisionTypes, KinematicCharacterController, QueryFilterFlags } from '@dimforge/rapier3d-compat';
import { useFrame } from '@react-three/fiber';
import { HandleOptions, TransformHandlesProperties } from '@react-three/handle';
import { IntersectionEnterPayload, IntersectionExitPayload, RigidBodyProps, RoundCuboidColliderProps, useRapier } from '@react-three/rapier';
import { useXR } from '@react-three/xr';
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
	// which plane types are we contacting?
	const snappedTo = useEditorStore(useShallow((s) => s.intersections[id] ?? []));
	const isOnFloor = snappedTo.some((plane) => plane.semanticLabel === 'floor');

	const controllerRef = useRef<KinematicCharacterController | null>(null);
	const { world } = useRapier();

	// initialize controller. use maximally permissive sliding
	// so that the user can drag the object around along walls and floors
	// of all angles.
	useEffect(() => {
		const controller = world.createCharacterController(0.005);
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
	const handleStateRef = useRef({
		// for capturing movement
		translation: new Vector3(),
		rotation: new Quaternion(),
		rotationDelta: new Quaternion(),
		translationDelta: new Vector3(),
		previousTranslation: new Vector3(),

		// for computing per frame
		projectionTmp: new Vector3(),
		projectionResult: new Vector3(),
		tmpEuler: new Euler(),
	});

	const apply = useCallback(
		(state: HandleState, _target: Object3D) => {
			// don't bother if dependencies aren't ready
			if (!rigidBodyRef.current || !controllerRef.current) return;
			const body = rigidBodyRef.current;

			const { translationDelta, previousTranslation } = handleStateRef.current;

			// set flag to prevent external updates to position
			if (state.first) {
				isDraggingRef.current = true;
				console.debug('start dragging');
			}

			// if a delta is available, apply it to the kinematic controller, and then
			// use the computed movement to update the rigid body.
			if (state.delta && state.previous) {
				// get the diff TODO: won't be necessary once https://github.com/pmndrs/xr/issues/383 is fixed
				translationDelta.subVectors(state.current.position, state.previous.position);
				previousTranslation.copy(state.previous.position);
				// since handles rotate with the object, we have to apply the object's rotation
				// to the movement vector to get it in world space.
				translationDelta.applyQuaternion(body.rotation());
			}

			// clear flag when dragging is done and update the position in the store
			if (state.last) {
				isDraggingRef.current = false;
				// TODO: this should move after the body is updated, not here.
				updatePosition({
					position: body.translation(),
					rotation: body.rotation(),
				});
			}
		},
		[updatePosition]
	);

	const applyControllerMovement = useCallback(() => {
		const controller = controllerRef.current;
		const body = rigidBodyRef.current;
		if (!controller || !body) return;

		const collider = body.collider(0);
		const { translation, translationDelta, previousTranslation } = handleStateRef.current;

		if (translationDelta.lengthSq() === 0) return;
		// exclude sensors -- we want to intersect these so we can detect snap areas, we only want
		// to slide against walls and floors.
		controller.computeColliderMovement(collider, translationDelta, QueryFilterFlags.EXCLUDE_SENSORS);
		translationDelta.copy(controller.computedMovement());
		translation.addVectors(body.translation(), translationDelta);
		body.setNextKinematicTranslation(translation);
		// delta was applied, reset it (otherwise we will continually apply it if it is not updated by the handle)
		translationDelta.set(0, 0, 0);
	}, []);

	const applyControllerRotation = useCallback(() => {
		const controller = controllerRef.current;
		const body = rigidBodyRef.current;
		if (!controller || !body) return;

		const { rotation, rotationDelta } = handleStateRef.current;

		rotation.copy(body.rotation()).multiply(rotationDelta);
		body.setNextKinematicRotation(rotation);

		// delta was applied, reset it (otherwise we will continually apply it if it is not updated by the handle)
		rotationDelta.set(0, 0, 0, 1);
	}, []);

	const { originReferenceSpace } = useXR();
	useFrame((_s, _d, frame: XRFrame) => {
		// enforce position and rotation constraints
		if (!rigidBodyRef.current || !controllerRef.current) return;
		const body = rigidBodyRef.current;

		// grab our state temp vals
		const { translation, translationDelta, rotation, rotationDelta, tmpEuler } = handleStateRef.current;

		if (!originReferenceSpace || !frame) {
			// we're probably not in XR? enforce nothing.
			applyControllerMovement();
			applyControllerRotation();
			return;
		}

		// for position snapping - basically project the velocity into all snapped planes
		// and whichever has the largest magnitude wins. if we're snapped to a wall and a floor
		// at the same time, whichever one we're moving _more_ along is the one we snap to.
		const planeNormals = snappedTo.map((plane) => getXRPlaneCenterAndNormal(frame, originReferenceSpace, plane).normal);
		const snappedIndex = getMostIntentionalPlaneSnappedMovement(translationDelta, planeNormals);
		const snappedPlane = snappedTo[snappedIndex];

		if (!snappedPlane) {
			// ok, so we're not close to anything. no constraint enforced
			// TODO: enforce something here? drop it to the floor?
			applyControllerMovement();
		} else {
			// prospectively apply the movement, we will use this to determine the closest
			// point on the plane itself
			translation.addVectors(body.translation(), translationDelta);
			// snap the resulting position onto the plane itself
			// TODO: this might not be right since it puts the thing right into the plane
			const closest = getClosestPointOnXRPlane(frame, originReferenceSpace, snappedPlane, translation);
			// retroactively get the movement delta from this new final position
			translationDelta.subVectors(closest, body.translation());
			// apply this via the character controller
			applyControllerMovement();
		}

		// for rotation, we only allow rotation on the Y axis when snapped to the floor.
		// previous calculations of 'snap' only apply to movement since they are based on
		// movement magnitude. if the user is only rotating a handle, there is no movement,
		// so there's no concept of which plane is favored. in this case we just do a naive
		// check that the floor is in contact and allow rotation. if the floor is not in
		// contact, and a wall is, we set the rotation to match the normal of the wall plane.
		const floorPlane = snappedTo.find((plane) => plane.semanticLabel === 'floor');
		const wallPlane = snappedTo.find((plane) => plane.semanticLabel === 'wall');
		if (floorPlane) {
			// restrict rotation delta to Y axis
			tmpEuler.setFromQuaternion(rotationDelta);
			tmpEuler.x = 0;
			tmpEuler.z = 0;
			rotationDelta.setFromEuler(tmpEuler);
			applyControllerRotation();
		} else if (wallPlane) {
			const { normal } = getXRPlaneCenterAndNormal(frame, originReferenceSpace, wallPlane);
			// skipping applyControllerRotation since we know the absolute rotation here.
			rotation.setFromUnitVectors(new Vector3(0, 1, 0), normal);
			body.setNextKinematicRotation(rotation);
		}
	});

	const onIntersectionEnter = useCallback(
		(intersection: IntersectionEnterPayload) => {
			const userData = intersection.rigidBody?.userData;
			if (isXRPlaneUserData(userData)) {
				updateIntersectionEnter(id, userData.plane);
			}
		},
		[id, updateIntersectionEnter]
	);

	const onIntersectionExit = useCallback(
		(intersection: IntersectionExitPayload) => {
			const userData = intersection.rigidBody?.userData;
			if (isXRPlaneUserData(userData)) {
				updateIntersectionExit(id, userData.plane);
			}
		},
		[id, updateIntersectionExit]
	);

	const rotateHandleApply = useCallback((state: HandleState, _target: Object3D) => {
		if (state.delta && state.previous) {
			const { rotationDelta } = handleStateRef.current;
			rotationDelta.copy(state.previous.quaternion);
			rotationDelta.invert().premultiply(state.current.quaternion);
		}
	}, []);
	const rotateHandleProps: HandleOptions<unknown> | null = isOnFloor
		? {
				apply: rotateHandleApply,
				scale: false,
				rotate: { x: false, y: true, z: false },
			}
		: null;

	return {
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
			onCollisionEnter: () => {
				console.log('collision enter');
			},
		} satisfies RigidBodyProps & { ref: RefObject<RRigidBody> },
		colliderProps: {
			activeCollisionTypes: ActiveCollisionTypes.KINEMATIC_FIXED,
		} satisfies Partial<RoundCuboidColliderProps>,
	};
}
