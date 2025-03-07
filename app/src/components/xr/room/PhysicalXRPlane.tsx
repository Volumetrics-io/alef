import { useEnvironmentStore } from '@/stores/environmentStore';
import { useGlobalLighting } from '@/stores/roomStore';
import { ErrorBoundary } from '@alef/sys';
import type { RigidBody as RRigidBody } from '@dimforge/rapier3d-compat';
import { useFrame } from '@react-three/fiber';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { useXR, XRPlaneModel, XRSpace } from '@react-three/xr';
import { forwardRef, useRef } from 'react';
import { DoubleSide, Object3D, ShadowMaterial, Vector3 } from 'three';

export interface PhysicalXRPlaneProps {
	/** Whether to add a sensor for snapping moved objects to this plane when they're close */
	snapSensor?: boolean;
	plane: XRPlane;
	debug?: boolean;
}

// amount to add to size of XRPlane when creating the collider. we want to avoid
// planes not quite touching at the edges which seems to happen by default.
const PLANE_EXTENSION_BUFFER = 0.1;

export const PhysicalXRPlane = forwardRef<Object3D, PhysicalXRPlaneProps>(function PhysicalXRPlane({ plane, snapSensor = true, debug }, ref) {
	const { originReferenceSpace } = useXR();
	const [globalLighting] = useGlobalLighting();

	// sync sunlight to shadow material
	const shadowMaterialRef = useRef<ShadowMaterial>(null);
	useFrame(() => {
		const sunlightIntensity = useEnvironmentStore.getState().sunlightIntensity;
		if (shadowMaterialRef.current) {
			shadowMaterialRef.current.opacity = 0.3 * (globalLighting.intensity + sunlightIntensity) * 0.5;
		}
	});

	// enforce position of rigid body by computing the pose of the
	// provided plane
	const bodyRef = useRef<RRigidBody>(null);
	useFrame((_s, _d, frame: XRFrame) => {
		if (!originReferenceSpace || !frame) return;
		const pose = frame.getPose(plane.planeSpace, originReferenceSpace);
		if (!pose) return;
		const position = pose.transform.position;
		const rotation = pose.transform.orientation;
		bodyRef.current?.setTranslation({ x: position.x, y: position.y, z: position.z }, false);
		bodyRef.current?.setRotation({ x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w }, false);
	});

	const halfExtents = [getSizeOfPolygonDimension(plane.polygon, 'x') / 2 + PLANE_EXTENSION_BUFFER, 0.02, getSizeOfPolygonDimension(plane.polygon, 'z') / 2] as [
		number,
		number,
		number,
	];
	const sensorHalfExtents = [halfExtents[0], 0.4, halfExtents[2]] as [number, number, number];

	return (
		<ErrorBoundary fallback={null}>
			<RigidBody type="fixed" colliders={false} ref={bodyRef}>
				<CuboidCollider args={halfExtents} position={new Vector3(0, 0, 0)} />
				{/* A larger Sensor allows us to detect when furniture is close to the wall */}
				{snapSensor && <CuboidCollider args={sensorHalfExtents} position={[0, 0.2, 0]} sensor />}
			</RigidBody>
			<XRSpace space={plane.planeSpace} ref={ref}>
				<XRPlaneModel renderOrder={-1} plane={plane} receiveShadow={true}>
					<shadowMaterial ref={shadowMaterialRef} side={DoubleSide} shadowSide={DoubleSide} transparent={true} opacity={0} />
				</XRPlaneModel>
				<XRPlaneModel renderOrder={-1} plane={plane} position={[0, 0.01, 0]}>
					{/* temp debug - render plane color when snapping */}
					<meshBasicMaterial colorWrite={false} color={0x002040} side={DoubleSide} />
				</XRPlaneModel>
			</XRSpace>
		</ErrorBoundary>
	);
});

function getSizeOfPolygonDimension(polygon: XRPlane['polygon'], field: 'x' | 'z') {
	let min = Infinity;
	let max = -Infinity;
	for (const point of polygon) {
		min = Math.min(min, point[field]);
		max = Math.max(max, point[field]);
	}
	return Math.abs(max - min);
}
