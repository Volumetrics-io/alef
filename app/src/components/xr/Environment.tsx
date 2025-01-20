import { useEnvironmentStore } from '@/stores/environmentStore';
import type { RigidBody as RRigidBody } from '@dimforge/rapier3d-compat';
import { useFrame } from '@react-three/fiber';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { useXR, useXRPlanes, XRPlaneModel, XRSpace } from '@react-three/xr';
import { useRef } from 'react';
import { DoubleSide, ShadowMaterial } from 'three';

export const Environment = ({ children }: { children: React.ReactNode }) => {
	const planes = useXRPlanes();

	return (
		<group>
			{planes.map((plane, index) => {
				return <PhysicalXRPlane key={index} plane={plane} />;
			})}
			{children}
		</group>
	);
};

function PhysicalXRPlane({ plane }: { plane: XRPlane }) {
	const { originReferenceSpace } = useXR();

	// sync sunlight to shadow material
	const shadowMaterialRef = useRef<ShadowMaterial>(null);
	useFrame(() => {
		const sunlightIntensity = useEnvironmentStore.getState().sunlightIntensity;
		if (shadowMaterialRef.current) {
			shadowMaterialRef.current.opacity = 0.2 * sunlightIntensity;
		}
	});

	// enforce position of rigid body by computing the pose of the
	// provided plane
	const bodyRef = useRef<RRigidBody>(null);
	useFrame((_s, _d, frame: XRFrame) => {
		if (!originReferenceSpace) return;
		const pose = frame.getPose(plane.planeSpace, originReferenceSpace);
		if (!pose) return;
		const position = pose.transform.position;
		const rotation = pose.transform.orientation;
		bodyRef.current?.setTranslation({ x: position.x, y: position.y, z: position.z }, false);
		bodyRef.current?.setRotation({ x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w }, false);
	});

	const halfExtents = [getSizeOfPolygonDimension(plane.polygon, 'x') / 2, 0.01, getSizeOfPolygonDimension(plane.polygon, 'z') / 2] as [number, number, number];
	console.log(plane.semanticLabel, halfExtents, plane.polygon);

	return (
		<XRSpace space={plane.planeSpace}>
			<RigidBody type="fixed" colliders={false} ref={bodyRef}>
				<CuboidCollider args={halfExtents} />
			</RigidBody>
			<XRPlaneModel renderOrder={-1} plane={plane} receiveShadow={true}>
				<shadowMaterial ref={shadowMaterialRef} side={DoubleSide} shadowSide={DoubleSide} transparent={true} opacity={0} />
			</XRPlaneModel>
			<XRPlaneModel renderOrder={-1} plane={plane} position={[0, 0.01, 0]}>
				<meshBasicMaterial colorWrite={false} side={DoubleSide} />
			</XRPlaneModel>
		</XRSpace>
	);
}

function getSizeOfPolygonDimension(polygon: XRPlane['polygon'], field: 'x' | 'z') {
	let min = Infinity;
	let max = -Infinity;
	for (const point of polygon) {
		min = Math.min(min, point[field]);
		max = Math.max(max, point[field]);
	}
	return Math.abs(max - min);
}
