import { UnknownRoomPlaneData } from '@alef/common';
import { Matrix4, Quaternion, Vector3 } from 'three';

export function getExtentsFromXRPlane(plane: XRPlane) {
	const minW = Math.min(...plane.polygon.map((p) => p.x));
	const maxW = Math.max(...plane.polygon.map((p) => p.x));
	const minH = Math.min(...plane.polygon.map((p) => p.z));
	const maxH = Math.max(...plane.polygon.map((p) => p.z));
	return [maxW - minW, maxH - minH] as [number, number];
}

export function xrPlanesToRoomPlaneData(frame: XRFrame, rootSpace: XRReferenceSpace, planes: readonly XRPlane[]): UnknownRoomPlaneData[] {
	// find a floor. if there is no floor, we can't do anything
	const floor = planes.find((p) => p.semanticLabel === 'floor');
	if (!floor) {
		return [];
	}

	// for each plane, get the matrix relative to the floor's matrix. the center of the floor
	// is the origin of the scene.
	const floorPose = frame.getPose(floor.planeSpace, rootSpace);
	if (!floorPose) {
		return [];
	}

	const floorMatrix = new Matrix4().fromArray(floorPose.transform.matrix);
	let tmpMatrix = new Matrix4();
	return planes
		.map((plane) => {
			const pose = frame.getPose(plane.planeSpace, rootSpace);
			if (!pose) {
				return null;
			}

			tmpMatrix.fromArray(pose.transform.matrix);
			tmpMatrix.premultiply(floorMatrix);
			const center = new Vector3().setFromMatrixPosition(tmpMatrix);
			const orientation = new Quaternion().setFromRotationMatrix(tmpMatrix);

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
