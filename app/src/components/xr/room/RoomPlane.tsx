import { useCameraForward } from '@/hooks/useCameraOrigin';
import { DEBUG } from '@/services/debug';
import { RoomPlaneData } from '@alef/common';
import { ErrorBoundary } from '@alef/sys';
import { GroupProps, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { ColorRepresentation, Mesh, Quaternion, Vector3 } from 'three';

export interface DemoPlaneProps extends GroupProps {
	plane: RoomPlaneData;
}

export function RoomPlane({ plane, ...rest }: DemoPlaneProps) {
	const { orientation: rawOrientation, origin: rawCenter, extents: dimensions, label } = plane;
	const orientation = new Quaternion().copy(rawOrientation);
	const center = new Vector3().copy(rawCenter);

	const color = DEBUG ? (debugColors[label] ?? 'pink') : (planeColors[label] ?? 'white');

	const depth = planeDepths[plane.label];

	return (
		<ErrorBoundary fallback={null}>
			<group rotation={[Math.PI, 0, 0]} {...rest}>
				<group position={center} quaternion={orientation}>
					{depth ? <RoomPlaneBox extents={dimensions} color={color} depth={depth} /> : <RoomPlaneFlat extents={dimensions} color={color} />}
					{DEBUG && <arrowHelper args={[new Vector3(0, 1, 0), new Vector3(0, 0, 0), 0.5, 'red']} />}
				</group>
			</group>
		</ErrorBoundary>
	);
}

function RoomPlaneFlat({ extents, color }: { extents: [number, number]; color: ColorRepresentation }) {
	return (
		<mesh receiveShadow rotation={[Math.PI / 2, 0, 0]}>
			<planeGeometry args={extents} />
			<meshPhysicalMaterial color={color} />
		</mesh>
	);
}

function RoomPlaneBox({ extents, color, depth }: { extents: [number, number]; color: ColorRepresentation; depth: number }) {
	const meshRef = useRef<Mesh>(null);
	// hide mesh when its normal aligns with camera; i.e. camera is looking at the back of it
	const tempVec = new Vector3();
	const getCameraForward = useCameraForward();
	useFrame(() => {
		if (meshRef.current) {
			meshRef.current.visible = true;
			meshRef.current.getWorldDirection(tempVec);
			const camDir = getCameraForward();
			if (tempVec.dot(camDir) < 0) {
				meshRef.current.visible = false;
			}
		}
	});

	return (
		<mesh receiveShadow ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
			<boxGeometry args={[extents[0], extents[1], depth]} />
			<meshPhysicalMaterial color={color} />
		</mesh>
	);
}

const planeDepths: Record<string, number | undefined> = {
	door: 0.05,
	window: 0.025,
	'wall art': 0.01,
	storage: 0.05,
	table: 0.05,
};

const planeColors: Record<string, ColorRepresentation> = {
	// only non-white colors need to be put here.
	storage: 0xead1ff,
	table: 0xead1ff,
	'wall art': 0xead1ff,
	window: 0xfff9e2,
	door: 0xefefef,
};

const debugColors: Record<string, string> = {
	wall: 'white',
	floor: 'blue',
	ceiling: 'green',
	door: 'yellow',
	table: 'brown',
	'wall art': 'purple',
	storage: 'orange',
	window: 'lightblue',
};
