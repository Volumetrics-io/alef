import { useThree } from '@react-three/fiber';
import { Object3D, Vector3 } from 'three';

/**
 * Hook to convert camera-relative positions to world positions
 * @param relativePosition Vector3 position relative to camera
 * @returns Vector3 position in world space
 */
export const useCameraOrigin = () => {
	const camera = useThree((state) => state.camera);
	const worldPosition = new Vector3();

	const getWorldPosition = () => {
		// Get camera's world position and rotation
		camera.getWorldPosition(worldPosition);
		return worldPosition;
	};

	return getWorldPosition;
};

const forward = new Object3D();

export const useCameraForward = () => {
	const camera = useThree((state) => state.camera);
	if (forward.parent !== camera) {
		camera.add(forward);
	}

	const forwardVector = new Vector3();

	const getForward = (offset = 0.5) => {
		forward.position.set(0, 0, -offset);
		return forward.getWorldPosition(forwardVector);
	};

	return getForward;
};
