import { SimpleQuaternion, SimpleVector3 } from '@alef/common';
import { ErrorBoundary } from '@alef/sys';
import { Quaternion, Vector3 } from 'three';

export interface DemoPlaneProps {
	orientation: SimpleQuaternion;
	center: SimpleVector3;
	dimensions: [number, number];
	label: string;
	id?: string;
}

export function DemoPlane({ orientation: rawOrientation, center: rawCenter, dimensions, label }: DemoPlaneProps) {
	const orientation = new Quaternion().copy(rawOrientation);
	const center = new Vector3().copy(rawCenter);

	return (
		<ErrorBoundary fallback={null}>
			<group rotation={[Math.PI, 0, 0]}>
				<group position={center} quaternion={orientation}>
					<mesh receiveShadow rotation={[Math.PI / 2, 0, 0]}>
						<planeGeometry args={dimensions} />
						<meshPhysicalMaterial color={labelColors[label] ?? 'pink'} />
					</mesh>
				</group>
			</group>
		</ErrorBoundary>
	);
}

const labelColors: Record<string, string> = {
	wall: 'white',
	floor: 'blue',
	ceiling: 'green',
	door: 'yellow',
	table: 'brown',
	'wall art': 'purple',
	storage: 'orange',
	window: 'lightblue',
};
