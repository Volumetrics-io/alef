import { useThree } from '@react-three/fiber';
import { useXR, XROrigin } from '@react-three/xr';
import { useMemo } from 'react';
import { Vector3 } from 'three';

export function UserOrigin() {
	const camera = useThree((state) => state.camera);
	const session = useXR((state) => state.session);

	const origin: Vector3 = useMemo(() => {
		if (!session) return new Vector3(0, 0, 0);
		const result = new Vector3();
		const direction = new Vector3();
		camera.getWorldPosition(result);
		result.y *= -1;
		camera.getWorldDirection(direction);
		direction.multiplyScalar(-0.5);
		result.x = direction.x;
		result.z = direction.z;
		return result;
	}, [session, camera]);

	return <XROrigin position={origin} />;
}
