import { ThreeEvent } from '@react-three/fiber';
import React, { useCallback, useContext, useRef, useState } from 'react';
import { Group, Vector3 } from 'three';

import { KinematicCharacterController, RigidBody as RRigidBody } from '@dimforge/rapier3d-compat';
import { RigidBody, useRapier } from '@react-three/rapier';
import { useEffect } from 'react';
import { DragContext } from './Draggable';

export function PhysicsDraggable({ children, onRest }: { children: React.ReactNode; onRest?: (position: Vector3) => void }) {
	const groupRef = useRef<Group>(null);
	const rigidBodyRef = useRef<RRigidBody>(null);
	const [isDragging, setIsDragging] = useState(false);
	const lastPointerPosition = useRef<Vector3>(new Vector3());
	const worldPosition = useRef<Vector3>(new Vector3());

	const currentPointerPositionRef = useRef(new Vector3());
	const deltaRef = useRef(new Vector3());

	const controllerRef = useRef<KinematicCharacterController>(null);
	const { world } = useRapier();
	useEffect(() => {
		const controller = world.createCharacterController(0.1);
		controllerRef.current = controller;
	}, [world]);

	const handlePointerMove = useCallback(
		(event: ThreeEvent<PointerEvent>) => {
			/**
			 * ADAPTATION NOTE
			 *
			 * original code converted position to local space of the parent, but
			 * with the rigidbody we are dealing in the world space of the simulation.
			 */

			if (isDragging && lastPointerPosition.current) {
				if (!groupRef.current || !groupRef.current.parent || !rigidBodyRef.current || !controllerRef.current) return;
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
		},
		[isDragging]
	);

	const handlePointerUp = useCallback(() => {
		if (isDragging) {
			setIsDragging(false);
			lastPointerPosition.current.set(0, 0, 0);
			onRest?.(worldPosition.current);
		}
	}, [isDragging, onRest]);

	return (
		<DragContext.Provider
			value={{
				setIsDragging,
				isDragging,
				setInitialPosition: (pos: Vector3) => {
					lastPointerPosition.current.copy(pos);
				},
			}}
		>
			<RigidBody type="kinematicPosition" colliders="ball">
				<group ref={groupRef} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
					{children}
				</group>
			</RigidBody>
		</DragContext.Provider>
	);
}

export function PhysicsDragHandle({ children }: { children: React.ReactNode }) {
	const context = useContext(DragContext);

	if (!context) {
		throw new Error('DragController must be used within a Draggable component');
	}

	const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
		context.setIsDragging(true);
		// @ts-expect-error NOTE: This does exist on the event object
		context.setInitialPosition(event.pointerPosition);
	};

	return <group onPointerDown={handlePointerDown}>{children}</group>;
}
