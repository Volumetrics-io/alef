import { useFrame, useThree } from '@react-three/fiber';
import { Group } from 'three';
import { useRef } from 'react';
import { Vector3 } from 'three';

export function Billboard({ enabled = true, children }: { enabled?: boolean; children: React.ReactNode }) {
	const groupRef = useRef<Group>(null);
	const camera = useThree((state) => state.camera);
	const cameraWorldPos = new Vector3();

	const directionToCamera = new Vector3();

	useFrame(() => {
		if (groupRef.current && enabled) {
			camera.getWorldPosition(cameraWorldPos);
			groupRef.current.parent?.worldToLocal(cameraWorldPos);
			directionToCamera.set(cameraWorldPos.x - groupRef.current.position.x, 0, cameraWorldPos.z - groupRef.current.position.z).normalize();

			const angleToCamera = Math.atan2(directionToCamera.z, -directionToCamera.x) - Math.PI / 2;
			groupRef.current.rotation.y = angleToCamera;
			groupRef.current.rotation.x = 0;
			groupRef.current.rotation.z = 0;
		}
	});

	return <group ref={groupRef}>{children}</group>;
}
