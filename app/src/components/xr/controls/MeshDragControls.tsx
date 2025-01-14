import { Vector3, Group, Object3D } from 'three';
import React, { useState,  useContext, useCallback } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { useRef } from 'react';

import { DragContext, DragContextType } from './Draggable';

export function MeshDraggable({ fixed, children }: { fixed: boolean, children: React.ReactNode }) {
	const groupRef = useRef<Group>(null);
	const [isDragging, setIsDragging] = useState(false);
	const lastPointerPosition = useRef<Vector3>(new Vector3());
    const worldPosition = useRef<Vector3>(new Vector3());

	const currentPointerPosition = new Vector3();
	const delta = new Vector3();

	let distanceFromStart = 0;
	let scaleFactor = 1;

	const handlePointerMove = useCallback(
		(event: ThreeEvent<PointerEvent>) => {
			if (isDragging && lastPointerPosition.current) {
				if (!groupRef.current || !groupRef.current.parent) return;
				// @ts-ignore NOTE: This does exist on the event object
				currentPointerPosition.copy(event.pointerPosition);
				delta.subVectors(currentPointerPosition, lastPointerPosition.current);
				lastPointerPosition.current.copy(currentPointerPosition);

				// Calculate distance from initial position
				distanceFromStart = Math.abs(groupRef.current.position.distanceTo(currentPointerPosition));

				// Scale factor increases with distance (adjust multiplier as needed)
				scaleFactor = 1 + distanceFromStart * 5;
				delta.multiplyScalar(scaleFactor);
                
                groupRef.current.getWorldPosition(worldPosition.current);

                worldPosition.current.add(delta);

                groupRef.current.parent?.worldToLocal(worldPosition.current);

                if (fixed) {
                    worldPosition.current.setY(0);
                }

				groupRef.current.position.copy(worldPosition.current);
			}
		},
		[isDragging]
	);

	const handlePointerUp = useCallback(() => {
		if (isDragging) {
			setIsDragging(false);
			lastPointerPosition.current.set(0, 0, 0);
		}
	}, [isDragging]);

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
			{/* @ts-ignore NOTE: This is valid */}
			<group ref={groupRef} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
				{children}
			</group>
		</DragContext.Provider>
	);
}

export function MeshDragController({ children }: { children: React.ReactNode }) {
	const context = useContext(DragContext);

	if (!context) {
		throw new Error('DragController must be used within a Draggable component');
	}

	const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
		context.setIsDragging(true);
		// @ts-ignore NOTE: This does exist on the event object
		context.setInitialPosition(event.pointerPosition);
	};

	return (
		<group onPointerDown={handlePointerDown}>
			{children}
		</group>
	);
}
