import { id, PrefixedId } from './ids.js';
import type { RoomPlaneData, UnknownRoomPlaneData } from './rooms/state.js';

/**
 * Compares a new or updated planes with a list of preexisting detected planes. If the plane appears
 * to have the same identity as another plane, it replaces that plane in the list. Otherwise, it
 * adds it to the end. Any preexisting planes not matched by a new plane are removed.
 */
export function mergePlanes(existingPlanes: RoomPlaneData[], newPlanes: UnknownRoomPlaneData[]): RoomPlaneData[] {
	const mergedIds = new Set<PrefixedId<'rp'>>();
	let mergedPlanes = [...existingPlanes];
	for (const newPlane of newPlanes) {
		const matchedPlane = matchPlane(existingPlanes, newPlane);
		if (!matchedPlane) {
			const newId = id('rp');
			mergedPlanes = [...mergedPlanes, { ...newPlane, id: newId }];
			mergedIds.add(newId);
		} else {
			mergedPlanes = mergedPlanes.map((plane) =>
				plane === matchedPlane
					? {
							...newPlane,
							id: plane.id,
						}
					: plane
			);
			mergedIds.add(matchedPlane.id);
		}
	}

	// remove planes which weren't matched or added
	mergedPlanes = mergedPlanes.filter((plane) => mergedIds.has(plane.id));
	return mergedPlanes;
}

/**
 * Determines if the given unassigned plane data matches any of the existing planes with IDs.
 */
export function matchPlane(existingPlanes: RoomPlaneData[], newPlane: UnknownRoomPlaneData): RoomPlaneData | null {
	const candidates = existingPlanes.filter(
		(other) => isTypeMatch(other, newPlane) && isNormalClose(other, newPlane) && isPositionClose(other, newPlane) && isSizeClose(other, newPlane)
	);
	if (candidates.length === 0) {
		return null;
	}
	// narrow down to 1 candidate and replace it in the list
	const finalCandidate = candidates.sort(createDivergenceSorter(newPlane))[0];
	return finalCandidate;
}

const divergenceThresholds = {
	normal: 0.01,
	position: 0.1,
	size: 0.1,
};

export function isTypeMatch(planeA: UnknownRoomPlaneData, planeB: UnknownRoomPlaneData) {
	return planeA.label === planeB.label;
}

export function orientationDivergence(planeA: UnknownRoomPlaneData, planeB: UnknownRoomPlaneData) {
	// compare quaternions
	const dot =
		planeA.orientation.x * planeB.orientation.x +
		planeA.orientation.y * planeB.orientation.y +
		planeA.orientation.z * planeB.orientation.z +
		planeA.orientation.w * planeB.orientation.w;
	return Math.abs(dot);
}

export function isNormalClose(planeA: UnknownRoomPlaneData, planeB: UnknownRoomPlaneData) {
	const dot = orientationDivergence(planeA, planeB);
	return dot > 1 - divergenceThresholds.normal;
}

export function positionDivergence(planeA: UnknownRoomPlaneData, planeB: UnknownRoomPlaneData) {
	const dx = planeA.origin.x - planeB.origin.x;
	const dy = planeA.origin.y - planeB.origin.y;
	const dz = planeA.origin.z - planeB.origin.z;
	return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function isPositionClose(planeA: UnknownRoomPlaneData, planeB: UnknownRoomPlaneData) {
	return positionDivergence(planeA, planeB) < divergenceThresholds.position;
}

export function sizeDivergence(planeA: UnknownRoomPlaneData, planeB: UnknownRoomPlaneData) {
	const da = planeA.extents[0] + planeA.extents[1];
	const db = planeB.extents[0] + planeB.extents[1];
	return Math.abs(da - db);
}

export function isSizeClose(planeA: UnknownRoomPlaneData, planeB: UnknownRoomPlaneData) {
	return sizeDivergence(planeA, planeB) < divergenceThresholds.size;
}

export function createDivergenceSorter(unknownPlane: UnknownRoomPlaneData) {
	return function (a: UnknownRoomPlaneData, b: UnknownRoomPlaneData) {
		const size = (sizeDivergence(a, unknownPlane) - sizeDivergence(b, unknownPlane)) / divergenceThresholds.size;
		const position = (positionDivergence(a, unknownPlane) - positionDivergence(b, unknownPlane)) / divergenceThresholds.position;
		const normal = (orientationDivergence(a, unknownPlane) - orientationDivergence(b, unknownPlane)) / divergenceThresholds.normal;
		return size + position + normal;
	};
}
