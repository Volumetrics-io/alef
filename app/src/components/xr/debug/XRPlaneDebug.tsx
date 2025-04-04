import { xrPlanesToRoomPlaneData } from '@/physics/xrPlaneTools';
import { usePlanes } from '@/stores/propertyStore';
import { matchPlane, RoomPlaneData } from '@alef/common';
import { useSignal } from '@preact/signals-react';
import { Billboard } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Root, Text } from '@react-three/uikit';
import { useXR, useXRPlanes, XRSpace } from '@react-three/xr';
import { useRef } from 'react';
import { Euler, Mesh, Vector3 } from 'three';
import { Surface } from '../ui/Surface';

export interface DebugPlaneCenterProps {
	plane: XRPlane;
}

export function XRPlaneDebug({ plane }: DebugPlaneCenterProps) {
	const floors = useXRPlanes('floor'); // needed for some calculations
	const worldRef = useRef<Mesh>(null);
	const matchedRoomPlaneRef = useRef<RoomPlaneData | null>(null);
	const roomPlanes = usePlanes();

	const matchedIdSignal = useSignal('');

	const reference = useXR((s) => s.originReferenceSpace);
	useFrame((_, __, xrFrame) => {
		if (!reference || !xrFrame) return;
		const worldPoint = worldRef.current;
		if (!worldPoint) return;
		const pose = xrFrame.getPose(plane.planeSpace, reference);
		if (!pose) return;
		const position = pose.transform.position;
		worldPoint.position.set(position.x, position.y, position.z);

		const [thisPlanesData] = xrPlanesToRoomPlaneData(xrFrame, reference, [...floors, plane]);
		if (thisPlanesData) {
			matchedRoomPlaneRef.current = matchPlane(roomPlanes, thisPlanesData);
			matchedIdSignal.value = matchedRoomPlaneRef.current?.id ?? '';
		} else {
			matchedRoomPlaneRef.current = null;
			matchedIdSignal.value = '';
		}
	});

	return (
		<>
			<XRSpace space={plane.planeSpace}>
				<mesh position={[0, 0, 0]}>
					<boxGeometry args={[0.1, 0.1, 0.1]} />
					<meshBasicMaterial color="red" />
				</mesh>
				<arrowHelper args={[new Vector3(0, -1, 0), new Vector3(0, 0, 0), 0.5, 0xfff0]} />
				<group position={[0, -0.5, 0]}>
					<Billboard>
						<Root pixelSize={0.001}>
							<Surface>
								<Text>{matchedIdSignal}</Text>
							</Surface>
						</Root>
					</Billboard>
				</group>
			</XRSpace>
			<mesh ref={worldRef} rotation={new Euler(Math.PI / 4, Math.PI / 4, 0)}>
				<boxGeometry args={[0.1, 0.1, 0.1]} />
				<meshBasicMaterial color="blue" />
			</mesh>
		</>
	);
}
