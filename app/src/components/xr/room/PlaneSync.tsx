import { useFrameInterval } from '@/hooks/useFrameInterval';
import { getPrimaryFloorPlane, xrPlanesToRoomPlaneData } from '@/physics/xrPlaneTools';
import { useHasPlanes, usePlanes, usePlanesUpdatedAt, useUpdatePlanes } from '@/stores/roomStore';
import { arePlanesEqual, groupPlanesByRoom, UnknownRoomPlaneData } from '@alef/common';
import { useXR, useXRPlanes, useXRSpace } from '@react-three/xr';
import { proxy, useSnapshot } from 'valtio';
import { RoomChangedPrompt } from './RoomChangedPrompt';

const state = proxy({
	roomChangeDetected: false,
});

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
	const roomChangeDetected = useSnapshot(state).roomChangeDetected;

	if (roomChangeDetected) {
		// show the user a prompt to create a new room or replace existing room plane data
		return <RoomChangedPrompt />;
	}

	return null;
}

/** Update the backend's stored planes */
function useUpdatePlanesAsNeeded() {
	const planes = useXRPlanes();
	const planesUpdatedAt = usePlanesUpdatedAt();
	const hasPlanes = useHasPlanes();
	const updatePlanes = useUpdatePlanes();
	const referenceSpace = useXR((s) => s.originReferenceSpace);
	const viewerSpace = useXRSpace('viewer');
	const storedFloors = usePlanes((p) => p.label === 'floor');
	const storedFloor = storedFloors[0]; // a bit arbitrary, but we should only have one anyways.

	useFrameInterval((_, __, xrFrame: XRFrame) => {
		const planesAreOld = planesUpdatedAt === null || Date.now() - planesUpdatedAt > 1000 * 60; /* One minute */
		if (hasPlanes && !planesAreOld) {
			console.debug(`PlaneSync: planes are up to date`);
			return;
		}
		if (!referenceSpace || !viewerSpace) {
			console.debug(`PlaneSync: reference or viewer space not available`);
			return;
		}
		if (!planes.length) {
			// don't overwrite existing planes with an empty array
			return;
		}

		// determine primary floor (where the user is)
		const floor = getPrimaryFloorPlane(xrFrame, referenceSpace, planes, viewerSpace);
		if (!floor) {
			// could not determine the floor the user is on, can't do much.
			console.warn(`PlaneSync: could not determine primary floor`);
			return;
		}

		// convert XR planes to Alef room plane data
		const map = new WeakMap<XRPlane, UnknownRoomPlaneData>();
		const asRoomPlanes = xrPlanesToRoomPlaneData(xrFrame, referenceSpace, planes, floor, map);
		// find our floor
		const floorData = map.get(floor);
		if (!floorData) {
			// something went wrong, bail
			console.warn(`PlaneSync: XR floor plane was not converted to Alef room data`, 'xr floor:', floor, 'alef planes:', asRoomPlanes);
			return;
		}
		console.debug(asRoomPlanes);

		// group planes by room -- we only want to sync the planes from the room we are in.
		const byRoom = groupPlanesByRoom(asRoomPlanes);
		console.debug(byRoom);
		// determine which room group matches our floor
		const group = byRoom.floorGroups.find((g) => g.floor === floorData);
		if (!group) {
			// our floor did not produce a room group...
			console.warn(`PlaneSync: Floor plane did not produce a room group`, 'floor:', floorData, 'groups', byRoom);
			return;
		}

		// now, we want to compare the detected floor plane to any floor plane we already have
		// assigned to the current room. if they are different, we do not automatically write the
		// planes -- we will prompt the user that the room has detected as changed. they will take
		// action in one of two ways -- making a new room (at which point this difference check will
		// pass since there is no preexisting floor in the new room) or electing to replace the
		// existing room planes (which will wipe out the stored plane data, again causing this
		// check to pass).
		if (storedFloor) {
			if (!arePlanesEqual(storedFloor, floorData)) {
				state.roomChangeDetected = true;
				return;
			}
		} else {
			state.roomChangeDetected = false;
		}

		// process plane data in room store
		updatePlanes(group.allPlanes);
	}, 1_000 /* every second */);
}
