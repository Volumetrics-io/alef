import { UnknownRoomPlaneData, addVectors, copyVector, length, scaleVector, vec3 } from '@alef/common';
import { Matrix4, Quaternion, Vector3 } from 'three';

export function getExtentsFromXRPlane(plane: XRPlane) {
	const minW = Math.min(...plane.polygon.map((p) => p.x));
	const maxW = Math.max(...plane.polygon.map((p) => p.x));
	const minH = Math.min(...plane.polygon.map((p) => p.z));
	const maxH = Math.max(...plane.polygon.map((p) => p.z));
	return [maxW - minW, maxH - minH] as [number, number];
}

const temp1 = vec3(0, 0, 0);
const temp2 = vec3(0, 0, 0);
export function getPrimaryFloorPlane(frame: XRFrame, rootSpace: XRReferenceSpace, planes: readonly XRPlane[], viewerSpace: XRSpace): XRPlane | null {
	// get the user's position in the scene
	const userPose = frame.getViewerPose(rootSpace);
	if (!userPose) {
		return null;
	}
	copyVector(userPose.transform.position, temp2);
	// name temp2 for use in this fn and mutate it to represent the negative user position
	// which will be used to compute relative plane origins to sort by distance.
	const negativeUserPosition = temp2;
	scaleVector(negativeUserPosition, -1, negativeUserPosition);

	return (
		planes
			.filter((p) => p.semanticLabel === 'floor')
			// sort by proximity to the user, this is a heuristic to pick the "main" floor.
			.sort((a, b) => {
				const poseA = frame.getPose(a.planeSpace, rootSpace);
				const poseB = frame.getPose(b.planeSpace, rootSpace);
				if (!poseA && !poseB) {
					return 0;
				}
				if (!poseA) {
					return -1;
				}
				if (!poseB) {
					return 1;
				}

				// get relative distance to user
				copyVector(poseA.transform.position, temp1);
				addVectors(temp1, negativeUserPosition, temp1);
				const distA = length(temp1);
				copyVector(poseB.transform.position, temp1);
				addVectors(temp1, negativeUserPosition, temp1);
				const distB = length(temp1);
				return distA - distB;
			})[0]
	);
}

export function xrPlanesToRoomPlaneData(
	/** XRFrame is required to compute realtime poses */
	frame: XRFrame,
	/** The session reference origin, relative to which everything else is positioned */
	rootSpace: XRReferenceSpace,
	/** The XR planes to convert */
	planes: readonly XRPlane[],
	/** The floor must be decided beforehand, see getPrimaryFloorPlane. */
	floor: XRPlane,
	/** Optionally populate a map which can lookup which RoomPlaneData was computed from an XRPlane */
	planeMap?: WeakMap<XRPlane, UnknownRoomPlaneData>
): UnknownRoomPlaneData[] {
	// for each plane, get the matrix relative to the floor's matrix. the center of the floor
	// is the origin of the scene.
	const floorPose = frame.getPose(floor.planeSpace, rootSpace);
	if (!floorPose) {
		return [];
	}

	const floorInverseMatrix = new Matrix4().fromArray(floorPose.transform.matrix).invert();
	let tmpMatrix = new Matrix4();

	// temporary for debug
	const poses: [XRPlane, XRPose][] = [];

	const data = planes
		.map((plane) => {
			const pose = frame.getPose(plane.planeSpace, rootSpace);
			if (!pose) {
				return null;
			}
			poses.push([plane, pose]);

			tmpMatrix.fromArray(pose.transform.matrix);
			tmpMatrix.premultiply(floorInverseMatrix);
			const center = new Vector3().setFromMatrixPosition(tmpMatrix);
			const orientation = new Quaternion().setFromRotationMatrix(tmpMatrix);

			if (plane === floor && center.length() > 1e-16) {
				// this would suggest the math is wrong here. the floor plane
				// should be 0,0,0 and the orientation should be identity.
				console.warn('floor plane is not at origin', 'calculated center was', center);
			}

			const extents = getExtentsFromXRPlane(plane);
			const data = {
				// convert to POJOs to be safe.
				origin: { x: center.x, y: center.y, z: center.z },
				orientation: { x: orientation.x, y: orientation.y, z: orientation.z, w: orientation.w },
				extents,
				label: plane.semanticLabel ?? 'unknown',
			};
			if (planeMap) {
				planeMap.set(plane, data);
			}
			return data;
		})
		.filter((p) => p !== null);

	console.log(poses);

	return data;
}
