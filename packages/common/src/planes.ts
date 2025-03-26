import { dotProduct, normalize, quaternionToNormal } from './geometry.js';
import { id, PrefixedId } from './ids.js';
import { RoomPlaneData } from './rooms/index.js';
import type { UnknownRoomPlaneData } from './rooms/state.js';

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
	const candidates = existingPlanes.filter((other) => arePlanesEqual(other, newPlane));
	if (candidates.length === 0) {
		return null;
	}
	// narrow down to 1 candidate and replace it in the list
	const finalCandidate = candidates.sort(createDivergenceSorter(newPlane))[0];
	return finalCandidate;
}

export function arePlanesEqual(planeA: UnknownRoomPlaneData, planeB: UnknownRoomPlaneData) {
	return isTypeMatch(planeA, planeB) && isNormalClose(planeA, planeB) && isPositionClose(planeA, planeB) && isSizeClose(planeA, planeB);
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

interface RoomPlaneGroup<Plane extends UnknownRoomPlaneData> {
	floor: Plane;
	ceiling?: Plane;
	allPlanes: Plane[];
}
/**
 * Groups planes into rooms based on their proximity and orientation to "floor" planes.
 * If only one "floor" exists, this just returns one group with all the planes.
 * If multiple floors exist, the planes will be grouped by the floor determined to be associated
 * with them based on the algorithm.
 */
export function groupPlanesByRoom<Plane extends UnknownRoomPlaneData>(planes: Plane[]): { floorGroups: RoomPlaneGroup<Plane>[]; unassignedPlanes: Plane[] } {
	const floors = planes.filter((plane) => plane.label === 'floor');
	if (floors.length === 0) {
		return { floorGroups: [], unassignedPlanes: planes };
	}
	if (floors.length === 1) {
		return {
			floorGroups: [
				{
					floor: floors[0],
					allPlanes: [...planes],
				},
			],
			unassignedPlanes: [],
		};
	}

	const floorGroups: RoomPlaneGroup<Plane>[] = floors.map((floor) => ({
		floor,
		allPlanes: [floor],
	}));
	const otherPlanes: Plane[] = planes.filter((plane) => plane.label !== 'floor' && plane.label !== 'ceiling');
	const unassignedPlanes: Plane[] = [];

	// matching floors to ceilings first helps us match the other planes easier.
	const ceilings = planes.filter((plane) => plane.label === 'ceiling');
	for (const ceiling of ceilings) {
		const ceilingX = ceiling.origin.x;
		const ceilingZ = ceiling.origin.z;
		const candidateGroups = floorGroups.filter(({ floor }) => {
			// in WebXR, ceilings are below (!?) floors... everything is reversed basically?
			if (ceiling.origin.y >= floor.origin.y) {
				return false;
			}
			const halfWidth = floor.extents[0] / 2;
			const halfDepth = floor.extents[1] / 2;
			return ceilingX < floor.origin.x + halfWidth && ceilingX > floor.origin.x - halfWidth && ceilingZ < floor.origin.z + halfDepth && ceilingZ > floor.origin.z - halfDepth;
		});
		const closestGroup = candidateGroups.sort((a, b) => {
			return Math.abs(a.floor.origin.y - ceiling.origin.y) - Math.abs(b.floor.origin.y - ceiling.origin.y);
		})[0];
		if (closestGroup) {
			closestGroup.ceiling = ceiling;
			closestGroup.allPlanes.push(ceiling);
		} else {
			unassignedPlanes.push(ceiling);
		}
	}
	for (const plane of otherPlanes) {
		const closestFloorGroup = floorGroups
			.filter((group) => {
				const floor = group.floor;

				if (plane.label === 'wall') {
					// we check that the wall is between the floor and any provided ceiling on the Y axis
					if (group.ceiling) {
						const minY = Math.min(floor.origin.y, group.ceiling.origin.y);
						const maxY = Math.max(floor.origin.y, group.ceiling.origin.y);
						if (plane.origin.y - plane.extents[1] / 2 < minY || plane.origin.y + plane.extents[1] / 2 > maxY) {
							return false;
						}
					}

					// project a point up from the origin of the floor to the height of the origin of the wall/door/window.
					// the plane should roughly point _away_ from that point (because normals point outward in XR).
					const planeLocalHeight = plane.origin.y - floor.origin.y;
					const testPoint = { x: floor.origin.x, y: floor.origin.y + planeLocalHeight, z: floor.origin.z };
					const directionToTestPoint = normalize({
						x: testPoint.x - plane.origin.x,
						y: testPoint.y - plane.origin.y,
						z: testPoint.z - plane.origin.z,
					});
					const planeNormal = quaternionToNormal(plane.orientation);
					const dot = dotProduct(planeNormal, directionToTestPoint);
					if (dot > 0) {
						return false;
					}
				}

				return true;
			})
			.sort((a, b) => {
				return positionDivergence(a.floor, plane) - positionDivergence(b.floor, plane);
			})[0];
		if (closestFloorGroup) {
			closestFloorGroup.allPlanes.push(plane);
		} else {
			unassignedPlanes.push(plane);
		}
	}

	return { floorGroups, unassignedPlanes };
}
