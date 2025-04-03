import { xrPlanesToRoomPlaneData } from '@/physics/xrPlaneTools';
import { useHasPlanes, usePlanesUpdatedAt, useUpdatePlanes } from '@/stores/propertyStore';
import { useFrame } from '@react-three/fiber';
import { useXR, useXRPlanes } from '@react-three/xr';

/**
 * An invisible component that syncs XR plane data to the server.
 */
export function PlaneSync() {
	const isInSession = useXR((s) => !!s.session);

	// don't do anything if not in XR
	if (!isInSession) {
		return null;
	}

	return <PlaneSyncImpl />;
}

function PlaneSyncImpl() {
	useUpdatePlanesAsNeeded();
	return null;
}

/** Update the backend's room walls if they are not already set */
function useUpdatePlanesAsNeeded() {
	const planes = useXRPlanes();
	const planesUpdatedAt = usePlanesUpdatedAt();
	const hasPlanes = useHasPlanes();
	const updatePlanes = useUpdatePlanes();
	const referenceSpace = useXR((s) => s.originReferenceSpace);

	useFrame((_, __, xrFrame: XRFrame) => {
		const planesAreOld = planesUpdatedAt === null || Date.now() - planesUpdatedAt > 1000 * 60; /* One hour */
		if (hasPlanes && !planesAreOld) {
			return;
		}
		if (!referenceSpace) {
			return;
		}
		if (!planes.length) {
			// don't overwrite existing planes with an empty array
			return;
		}
		const asRoomPlanes = xrPlanesToRoomPlaneData(xrFrame, referenceSpace, planes);
		updatePlanes(asRoomPlanes);
	});
}
