import { useDebugStore } from '@/stores/debugStore';
import { useEffect, useRef } from 'react';
import { ArrowHelper, Vector3 } from 'three';

export function DebugDisplay() {
	const rawDragDeltaRef = useRef<ArrowHelper>(null);

	useEffect(() => {
		return useDebugStore.subscribe(
			(s) => s.rawDragDelta,
			(delta) => {
				if (!delta) {
					rawDragDeltaRef.current?.setDirection(new Vector3());
				} else {
					rawDragDeltaRef.current?.setDirection(delta);
					rawDragDeltaRef.current?.setLength(delta.length());
				}
			}
		);
	});
	useEffect(() => {
		return useDebugStore.subscribe(
			(s) => s.rawDragStart,
			(pos) => {
				if (!pos) {
					rawDragDeltaRef.current?.position.set(0, 0, 0);
				} else {
					rawDragDeltaRef.current?.position.copy(pos);
				}
			}
		);
	});

	return (
		<>
			<arrowHelper ref={rawDragDeltaRef} args={[new Vector3(), new Vector3(), 0, 0x8000ff]} />
		</>
	);
}
