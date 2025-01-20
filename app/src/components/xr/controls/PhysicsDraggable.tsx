import { ThreeEvent } from '@react-three/fiber';
import React, { useCallback, useRef } from 'react';
import { Group, Object3D, Vector3 } from 'three';

import { KinematicCharacterController, RigidBody as RRigidBody } from '@dimforge/rapier3d-compat';
import { RigidBody, useRapier } from '@react-three/rapier';
import { useEffect } from 'react';

export function PhysicsDraggable({ children, onRest }: { children: React.ReactNode; onRest?: (position: Vector3) => void }) {
	const groupRef = useRef<Group>(null);
	const rigidBodyRef = useRef<RRigidBody>(null);
	const isDraggingRef = useRef<boolean>(false);
	const lastPointerPosition = useRef<Vector3>(new Vector3());
	const worldPosition = useRef<Vector3>(new Vector3());

	const currentPointerPositionRef = useRef(new Vector3());
	const deltaRef = useRef(new Vector3());

	const controllerRef = useRef<KinematicCharacterController | null>(null);
	const { world } = useRapier();
	useEffect(() => {
		const controller = world.createCharacterController(0.1);
		controller.setMaxSlopeClimbAngle(Math.PI * 2);
		controller.setSlideEnabled(true);
		controller.disableSnapToGround();
		controllerRef.current = controller;
	}, [world]);

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
		onRest?.(worldPosition.current);
	}, [onRest]);

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

	return (
		<RigidBody type="kinematicPosition" colliders="cuboid" ref={rigidBodyRef}>
			<group ref={groupRef} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerCancel}>
				{children}
			</group>
		</RigidBody>
	);
}
