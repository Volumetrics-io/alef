import { Object3D } from 'three';

export function makeGlobalRootUserData() {
	return {
		type: 'globalRoot',
	};
}

export function isGlobalRoot(obj: Object3D) {
	return obj.userData.type === 'globalRoot';
}

/**
 * Accepts a child of the GlobalSpace component, and computes its
 * transform relative to GlobalSpace.
 */
export function getGlobalTransform(obj: Object3D) {
	// find global root parent
	let parent = obj.parent;
	while (parent && !isGlobalRoot(parent)) {
		parent = parent.parent;
	}
	if (!parent) {
		throw new Error(`Object ${obj.name} is not a child of the GlobalSpace component; cannot compute global transform.`);
	}

	// compute local transform relative to global root
	const matrix = obj.matrixWorld;
	const inverseMatrix = parent.matrixWorld.clone().invert();
	const localMatrix = matrix.premultiply(inverseMatrix);
	return localMatrix;
}
