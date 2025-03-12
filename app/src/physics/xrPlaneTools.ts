import { SimpleVector3, UnknownRoomPlaneData } from '@alef/common';
import { Matrix4, Quaternion, Vector3 } from 'three';

export function getExtentsFromXRPlane(plane: XRPlane) {
	const minW = Math.min(...plane.polygon.map((p) => p.x));
	const maxW = Math.max(...plane.polygon.map((p) => p.x));
	const minH = Math.min(...plane.polygon.map((p) => p.z));
	const maxH = Math.max(...plane.polygon.map((p) => p.z));
	return [maxW - minW, maxH - minH] as [number, number];
}

export function getPrimaryFloorPlane(frame: XRFrame, rootSpace: XRReferenceSpace, planes: readonly XRPlane[]): XRPlane | null {
	return (
		planes
			.filter((p) => p.semanticLabel === 'floor')
			// sort by proximity to the origin, i.e. which floor was closest when the session was
			// begun. this is a heuristic to pick the "main" floor.
			.sort((a, b) => {
				const poseA = frame.getPose(a.planeSpace, rootSpace);
				const poseB = frame.getPose(b.planeSpace, rootSpace);
				if (!poseA && poseB) {
					return -1;
				}
				if (poseA && !poseB) {
					return 1;
				}
				if (!poseA && !poseB) {
					return 0;
				}
				return length(poseA!.transform.position) - length(poseB!.transform.position);
			})[0]
	);
}

export function xrPlanesToRoomPlaneData(frame: XRFrame, rootSpace: XRReferenceSpace, planes: readonly XRPlane[]): UnknownRoomPlaneData[] {
	// find a floor. if there is no floor, we can't do anything
	const floor = getPrimaryFloorPlane(frame, rootSpace, planes);
	if (!floor) {
		return [];
	}

	// for each plane, get the matrix relative to the floor's matrix. the center of the floor
	// is the origin of the scene.
	const floorPose = frame.getPose(floor.planeSpace, rootSpace);
	if (!floorPose) {
		return [];
	}

	const floorInverseMatrix = new Matrix4().fromArray(floorPose.transform.matrix).invert();
	let tmpMatrix = new Matrix4();
	return planes
		.map((plane) => {
			const pose = frame.getPose(plane.planeSpace, rootSpace);
			if (!pose) {
				return null;
			}

			tmpMatrix.fromArray(pose.transform.matrix);
			tmpMatrix.premultiply(floorInverseMatrix);
			const center = new Vector3().setFromMatrixPosition(tmpMatrix);
			const orientation = new Quaternion().setFromRotationMatrix(tmpMatrix);

			if (plane === floor && center.length() > Number.EPSILON) {
				// this would suggest the math is wrong here. the floor plane
				// should be 0,0,0 and the orientation should be identity.
				console.warn('floor plane is not at origin', 'calculated center was', center);
			}

			const extents = getExtentsFromXRPlane(plane);
			return {
				// convert to POJOs to be safe.
				origin: { x: center.x, y: center.y, z: center.z },
				orientation: { x: orientation.x, y: orientation.y, z: orientation.z, w: orientation.w },
				extents,
				label: plane.semanticLabel ?? 'unknown',
			};
		})
		.filter((p) => p !== null);
}

function length(v: SimpleVector3) {
	return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}
