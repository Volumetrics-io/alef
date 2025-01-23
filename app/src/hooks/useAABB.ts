import { useCallback, useRef, useState } from 'react';
import { Box3, Group, Object3D, Vector3 } from 'three';

export function useAABB({ precise = false }: { precise?: boolean } = {}) {
	const boxRef = useRef(new Box3());
	const boxSizeRef = useRef(new Vector3());
	const boxCenterRef = useRef(new Vector3());
	const halfExtentsRef = useRef<[number, number, number]>([0, 0, 0]);

	const [updates, forceUpdate] = useState(0);

	const cbRef = useCallback(
		(obj: Object3D | Group | null) => {
			if (obj) {
				boxRef.current.setFromObject(obj, precise);
			} else {
				boxRef.current.makeEmpty();
			}
			forceUpdate((v) => v + 1);
		},
		[precise]
	);

	boxRef.current.getSize(boxSizeRef.current);
	boxRef.current.getCenter(boxCenterRef.current);

	halfExtentsRef.current[0] = boxSizeRef.current.x / 2;
	halfExtentsRef.current[1] = boxSizeRef.current.y / 2;
	halfExtentsRef.current[2] = boxSizeRef.current.z / 2;

	return { box: boxRef.current, size: boxSizeRef.current, center: boxCenterRef.current, halfExtents: halfExtentsRef.current, ref: cbRef, ready: updates > 0 };
}
