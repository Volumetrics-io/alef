import { Vector3 } from 'three';

export function getXRPlaneCenterAndNormal(frame: XRFrame, rootSpace: XRReferenceSpace, plane: XRPlane) {
	const pose = frame.getPose(plane.planeSpace, rootSpace);
	if (!pose) {
		return { center: new Vector3(0, 0, 0), normal: new Vector3(0, 1, 0) };
	}
	const orientationQuaternion = pose.transform.orientation;
	const orientation = new Vector3(orientationQuaternion.x, orientationQuaternion.y, orientationQuaternion.z);
	const center = new Vector3(pose.transform.position.x, pose.transform.position.y, pose.transform.position.z);
	return {
		normal: orientation,
		center,
	};
}

export function getClosestPointOnXRPlane(frame: XRFrame, rootSpace: XRReferenceSpace, plane: XRPlane, targetPoint: Vector3) {
	const { center, normal } = getXRPlaneCenterAndNormal(frame, rootSpace, plane);
	return getClosestPointOnPlane(normal, center, targetPoint);
}

const tmpVec1 = new Vector3();
const tmpVec2 = new Vector3();
export function getClosestPointOnPlane(planeNormal: Vector3, planePoint: Vector3, targetPoint: Vector3) {
	const direction = tmpVec1.copy(targetPoint).sub(planePoint);
	const distance = direction.dot(planeNormal);
	const scaledNormal = tmpVec2.copy(planeNormal).multiplyScalar(distance);
	tmpVec1.copy(targetPoint).sub(scaledNormal);
	return tmpVec1;
}

/**
 * Determines which plane a particular movement delta most aligns with. Returns the
 * index of that plane in the provided array.
 */
export function getMostIntentionalPlaneSnappedMovement(movement: Vector3, planeNormals: Vector3[]) {
	let matchedIndex = -1;
	if (!planeNormals.length) {
		return matchedIndex;
	}

	const movementNormalized = movement.clone().normalize();
	// alignment is measured with dot products. however, since we're looking for the most /along/ the
	// plane, a larger dot (more aligned with normal) is actually bad. negative dots are also treated
	// the same as positive (math.abs) -- we're really looking for closest to 0 here.

	// we start with a "best" of the absolute worst, which is 1 (total alignment with normal)
	// anything should beat this.
	let bestDot = 1;
	for (let i = 0; i < planeNormals.length; i++) {
		const dot = Math.abs(movementNormalized.dot(planeNormals[i]));
		if (dot < bestDot) {
			bestDot = dot;
			matchedIndex = i;
		}
	}

	return matchedIndex;
}
