import { ThreeEvent } from '@react-three/fiber';
import { forwardRef, useCallback, useRef, useState } from 'react';
import { Group, Vector3 } from 'three';
import { DragContext } from '../controls/Draggable';
import { BodyAnchor, BodyAnchorProps } from './BodyAnchor';

export const DraggableBodyAnchor = forwardRef<Group, BodyAnchorProps>(({ children, ...props }, ref) => {
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
			<BodyAnchor ref={groupRef} {...props} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
				{children}
			</BodyAnchor>
		</DragContext.Provider>
	);
});
