import { ThreeElements, useFrame, useThree } from '@react-three/fiber';
import * as React from 'react';
import { Euler, Group, Vector3 } from 'three';

export type BillboardProps = Omit<ThreeElements['group'], 'ref'> & {
	follow?: boolean;
	lockX?: boolean;
	lockY?: boolean;
	lockZ?: boolean;
};

/**
 * Wraps children in a billboarded group. Sample usage:
 *
 * ```js
 * <Billboard>
 *   <Text>hi</Text>
 * </Billboard>
 * ```
 */
export const Billboard = /* @__PURE__ */ React.forwardRef<Group, BillboardProps>(function Billboard(
	{ children, follow = true, lockX = false, lockY = false, lockZ = false, ...props },
	fref
) {
	const groupRef = React.useRef<Group>(null!);
	const camera = useThree((state) => state.camera);

	// Create reusable vectors to avoid garbage collection
	const tempVars = React.useRef({
		cameraWorldPos: new Vector3(),
		objectWorldPos: new Vector3(),
		directionToCamera: new Vector3(),
		localObjectPos: new Vector3(),
		localCameraPos: new Vector3(),
		originalRotation: new Euler(),
	});
	useFrame(() => {
		if (!follow || !groupRef.current) return;
		const { cameraWorldPos, objectWorldPos, directionToCamera, localObjectPos, localCameraPos, originalRotation } = tempVars.current;

		// Get camera position in world space
		camera.getWorldPosition(cameraWorldPos);

		// Get object position in world space
		groupRef.current.getWorldPosition(objectWorldPos);

		// Transform camera position to local space of the parent
		localCameraPos.copy(cameraWorldPos);
		if (groupRef.current.parent) {
			groupRef.current.parent.worldToLocal(localCameraPos);
		}

		// Get object position in local space
		localObjectPos.copy(groupRef.current.position);

		// Calculate direction from object to camera in local space
		directionToCamera.subVectors(localCameraPos, localObjectPos).normalize();

		// Store original rotation values for locked axes
		originalRotation.copy(groupRef.current.rotation);

		// Calculate rotation angles based on direction to camera
		if (!lockY) {
			// Y-axis rotation (horizontal)
			groupRef.current.rotation.y = Math.atan2(directionToCamera.x, directionToCamera.z);
		}

		if (!lockX) {
			// X-axis rotation (vertical)
			const horizontalLength = Math.sqrt(directionToCamera.z * directionToCamera.z + directionToCamera.x * directionToCamera.x);
			groupRef.current.rotation.x = -Math.atan2(directionToCamera.y, horizontalLength);
		}

		if (!lockZ) {
			// Z-axis rotation (roll)
			// This is typically not needed for billboarding, but included for completeness
			// We'll keep it at 0 by default
			groupRef.current.rotation.z = 0;
		}

		// Restore locked axes to their original values
		if (lockX) groupRef.current.rotation.x = originalRotation.x;
		if (lockY) groupRef.current.rotation.y = originalRotation.y;
		if (lockZ) groupRef.current.rotation.z = originalRotation.z;
	});

	React.useImperativeHandle(fref, () => groupRef.current, []);

	return (
		<group ref={groupRef} {...props}>
			{children}
		</group>
	);
});
