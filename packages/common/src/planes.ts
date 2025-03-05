import { id } from './ids';
import { RoomPlaneData, UnknownRoomPlaneData } from './state';

/**
 * Compares a new or updated plane with a list of preexisting detected planes. If the plane appears
 * to have the same identity as another plane, it replaces that plane in the list. Otherwise, it
 * adds it to the end.
 */
export function mergePlane(planes: RoomPlaneData[], unknownPlane: UnknownRoomPlaneData): RoomPlaneData[] {
	const candidates = planes.filter(
		(other) => isTypeMatch(other, unknownPlane) && isNormalClose(other, unknownPlane) && isPositionClose(other, unknownPlane) && isSizeClose(other, unknownPlane)
	);
	if (candidates.length === 0) {
		return [...planes, { ...unknownPlane, id: id('rp') }];
	} else {
		// narrow down to 1 candidate and replace it in the list
		let finalCandidate = candidates.sort(createDivergenceSorter(unknownPlane))[0];
		return planes.map((plane) =>
			plane === finalCandidate
				? {
						...unknownPlane,
						id: plane.id,
					}
				: plane
		);
	}
}

const divergenceThresholds = {
	normal: 0.01,
	position: 0.1,
	size: 0.1,
};

export function isTypeMatch(planeA: UnknownRoomPlaneData, planeB: UnknownRoomPlaneData) {
	return planeA.label === planeB.label;
}

export function normalDivergence(planeA: UnknownRoomPlaneData, planeB: UnknownRoomPlaneData) {
	return planeA.normal.x * planeB.normal.x + planeA.normal.y * planeB.normal.y + planeA.normal.z * planeB.normal.z;
}

export function isNormalClose(planeA: UnknownRoomPlaneData, planeB: UnknownRoomPlaneData) {
	const dot = normalDivergence(planeA, planeB);
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
		const normal = (normalDivergence(a, unknownPlane) - normalDivergence(b, unknownPlane)) / divergenceThresholds.normal;
		return size + position + normal;
	};
}
