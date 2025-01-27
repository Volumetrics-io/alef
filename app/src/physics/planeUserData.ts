import { getPlaneId } from '@/stores/planesStore';

export interface PlaneUserData {
	type: 'Plane';
	planeId: string;
}

export interface XRPlaneUserData extends PlaneUserData {
	xrPlane: XRPlane;
}

export function createXRPlaneUserData(plane: XRPlane): XRPlaneUserData {
	return {
		type: 'Plane',
		xrPlane: plane,
		planeId: getPlaneId(plane),
	};
}

export function createPlaneUserData(planeId: string): PlaneUserData {
	return {
		type: 'Plane',
		planeId,
	};
}

export function isXRPlaneUserData(userData: unknown): userData is XRPlaneUserData {
	return (userData as XRPlaneUserData)?.type === 'Plane' && !!(userData as XRPlaneUserData).xrPlane;
}

export function isPlaneUserData(userData: unknown): userData is PlaneUserData {
	return (userData as PlaneUserData)?.type === 'Plane';
}
