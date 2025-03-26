import { getPrimaryFloorPlane } from '@/physics/xrPlaneTools';
import { useFrame } from '@react-three/fiber';
import { useXR, useXRPlanes, useXRSpace } from '@react-three/xr';
import { useState } from 'react';

export function usePrimaryXRFloorPlane() {
	const [plane, setPlane] = useState<XRPlane | null>(null);
	const floorPlanes = useXRPlanes('floor');
	const reference = useXR((state) => state.originReferenceSpace);
	const viewer = useXRSpace('viewer');
	useFrame((_, __, xrFrame) => {
		if (!reference || !viewer) return;
		if (floorPlanes.length > 0) {
			const selected = getPrimaryFloorPlane(xrFrame, reference, floorPlanes, viewer);
			if (plane !== selected) {
				setPlane(selected);
			}
		}
	});

	return plane;
}
