import { Vector3 } from 'three';
import React, { useState, createContext, useContext, useCallback } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { Group } from 'three';
import { useRef } from 'react';
import { Container } from '@react-three/uikit';

// Create a context for the drag controls
interface DragContextType {
	isDragging: boolean;
	setIsDragging: (dragging: boolean) => void;
	setInitialPosition: (position: Vector3) => void;
}

const DragContext = createContext<DragContextType | null>(null);

export function Draggable({ children }: { children: React.ReactNode }) {
	const groupRef = useRef<Group>(null);
	const [isDragging, setIsDragging] = useState(false);
	const lastPointerPosition = useRef<Vector3>(new Vector3());

	const currentPointerPosition = new Vector3();
	const delta = new Vector3();

	let distanceFromStart = 0;
	let scaleFactor = 1;

	const handlePointerMove = useCallback(
		(event: ThreeEvent<PointerEvent>) => {
			if (isDragging && lastPointerPosition.current) {
				if (!groupRef.current) return;
				// @ts-ignore NOTE: This does exist on the event object
				currentPointerPosition.copy(event.pointerPosition);
				delta.subVectors(currentPointerPosition, lastPointerPosition.current);
				lastPointerPosition.current.copy(currentPointerPosition);

				// Calculate distance from initial position
				distanceFromStart = groupRef.current.position.distanceTo(currentPointerPosition);

				// Scale factor increases with distance (adjust multiplier as needed)
				scaleFactor = 1 + distanceFromStart * 2;
				delta.multiplyScalar(scaleFactor);

				groupRef.current.position.add(delta);
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

export function DragController({ children }: { children: React.ReactNode }) {
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
		<Container onPointerDown={handlePointerDown} padding={10} paddingBottom={30} width="100%" justifyContent="center" alignItems="center">
			{children}
		</Container>
	);
}
