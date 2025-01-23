export interface XRPlaneUserData {
	type: 'XRPlane';
	plane: XRPlane;
}

export function createXRPlaneUserData(plane: XRPlane): XRPlaneUserData {
	return {
		type: 'XRPlane',
		plane,
	};
}

export function isXRPlaneUserData(userData: unknown): userData is XRPlaneUserData {
	return (userData as XRPlaneUserData)?.type === 'XRPlane';
}
