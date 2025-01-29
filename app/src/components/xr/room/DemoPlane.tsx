import { createPlaneUserData } from '@/physics/planeUserData';
import { usePlanesStore } from '@/stores/planesStore';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { useEffect, useId, useRef } from 'react';
import { Quaternion, Vector3 } from 'three';
import { DebugPlaneNormal } from './DebugPlaneNormal';

export interface DemoPlaneProps {
	normal: number[];
	center: number[];
	dimensions: [number, number];
	label: string;
	debug?: boolean;
	snapSensor?: boolean;
}

export function DemoPlane({ normal: rawNormal, center: rawCenter, dimensions, label, debug, snapSensor = true }: DemoPlaneProps) {
	const id = useId();
	const normal = new Vector3(...rawNormal);
	normal.normalize();
	const center = new Vector3(...rawCenter);

	const updatePlane = usePlanesStore((s) => s.updatePlane);

	const onceRef = useRef({ center, normal });
	useEffect(() => {
		updatePlane(id, { label, ...onceRef.current });
	}, [label, id, updatePlane]);

	// orient from normal
	const quat = new Quaternion();
	quat.setFromUnitVectors(new Vector3(0, 1, 0), normal);

	return (
		<>
			<RigidBody type="fixed" colliders={false} userData={createPlaneUserData(id)} position={center} quaternion={quat}>
				<CuboidCollider args={[dimensions[0] / 2, 0.1, dimensions[1] / 2]} />
				{snapSensor && <CuboidCollider args={[dimensions[0] / 2, 0.4, dimensions[1] / 2]} position={[0, 0.2, 0]} sensor />}
				<group rotation={[Math.PI / 2, 0, 0]}>
					<mesh rotation={[0, Math.PI, 0]}>
						<planeGeometry args={dimensions} />
						<meshBasicMaterial color={0xaaaaaa} />
					</mesh>
				</group>
			</RigidBody>
			{debug && <DebugPlaneNormal planeId={id} />}
		</>
	);
}
