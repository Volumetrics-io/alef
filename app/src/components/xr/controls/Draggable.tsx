import { Vector3, Group } from 'three';
import React, { useState, createContext, useContext, useCallback } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { useRef } from 'react';
import { Container } from '@react-three/uikit';

// Create a context for the drag controls
export interface DragContextType {
	isDragging: boolean;
	setIsDragging: (dragging: boolean) => void;
	setInitialPosition: (position: Vector3) => void;
}

export const DragContext = createContext<DragContextType | null>(null);

export function Draggable({ fixed, children }: { fixed?: boolean, children: React.ReactNode }) {
	const groupRef = useRef<Group>(null);
	const [isDragging, setIsDragging] = useState(false);
	const lastPointerPosition = useRef<Vector3>(new Vector3());

	const currentPointerPosition = useRef(new Vector3());
	const delta = useRef(new Vector3());

	const handlePointerMove = useCallback(
		(event: ThreeEvent<PointerEvent>) => {
			if (isDragging && lastPointerPosition.current) {
				if (!groupRef.current) return;
				// @ts-expect-error NOTE: This does exist on the event object
				currentPointerPosition.current.copy(event.pointerPosition);
				delta.current.subVectors(currentPointerPosition.current, lastPointerPosition.current);
				lastPointerPosition.current.copy(currentPointerPosition.current);

				// Calculate distance from initial position
				const distanceFromStart = groupRef.current.position.distanceTo(currentPointerPosition.current);

				// Scale factor increases with distance (adjust multiplier as needed)
				const scaleFactor = 1 + distanceFromStart * 2;
				delta.current.multiplyScalar(scaleFactor);

                if (fixed) {
                    delta.current.setY(0);
                }

				groupRef.current.position.add(delta.current);
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
		// @ts-expect-error NOTE: This does exist on the event object
		context.setInitialPosition(event.pointerPosition);
	};

	return (
		<Container onPointerDown={handlePointerDown} padding={10} paddingBottom={30} width="100%" justifyContent="center" alignItems="center">
			{children}
		</Container>
	);
}
