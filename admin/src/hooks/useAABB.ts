import { useCallback, useRef, useState } from 'react';
import { Box3, Group, Object3D, Vector3 } from 'three';

export function useAABB({ precise = true }: { precise?: boolean } = {}) {
	const boxRef = useRef(new Box3());
	const [dimensions, setDimensions] = useState({
		size: new Vector3(),
		center: new Vector3(),
		halfExtents: [0, 0, 0] as [number, number, number]
	});

	const cbRef = useCallback(
		(obj: Object3D | Group | null) => {
			if (obj) {
				boxRef.current.setFromObject(obj, precise);
				const size = new Vector3();
				const center = new Vector3();
				boxRef.current.getSize(size);
				boxRef.current.getCenter(center);
				setDimensions({
					size,
					center,
					halfExtents: [size.x / 2, size.y / 2, size.z / 2]
				});
			} else {
				boxRef.current.makeEmpty();
				setDimensions({
					size: new Vector3(),
					center: new Vector3(),
					halfExtents: [0, 0, 0]
				});
			}
		},
		[precise]
	);

	return { 
		box: boxRef.current, 
		size: dimensions.size, 
		center: dimensions.center, 
		halfExtents: dimensions.halfExtents, 
		ref: cbRef 
	};
} 