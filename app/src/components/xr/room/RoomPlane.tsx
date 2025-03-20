import { DEBUG } from '@/services/debug';
import { RoomPlaneData } from '@alef/common';
import { ErrorBoundary } from '@alef/sys';
import { GroupProps } from '@react-three/fiber';
import { Quaternion, Vector3 } from 'three';

export interface DemoPlaneProps extends GroupProps {
	plane: RoomPlaneData;
}

export function RoomPlane({ plane, ...rest }: DemoPlaneProps) {
	const { orientation: rawOrientation, origin: rawCenter, extents: dimensions, label } = plane;
	const orientation = new Quaternion().copy(rawOrientation);
	const center = new Vector3().copy(rawCenter);

	const color = DEBUG ? (debugColors[label] ?? 'pink') : 'white';

	return (
		<ErrorBoundary fallback={null}>
			<group rotation={[Math.PI, 0, 0]} {...rest}>
				<group position={center} quaternion={orientation}>
					<mesh receiveShadow rotation={[Math.PI / 2, 0, 0]}>
						<planeGeometry args={dimensions} />
						<meshPhysicalMaterial color={color} />
					</mesh>
				</group>
			</group>
		</ErrorBoundary>
	);
}

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
