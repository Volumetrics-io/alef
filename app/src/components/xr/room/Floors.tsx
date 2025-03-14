import { GroupProps } from '@react-three/fiber';
import { useXRPlanes } from '@react-three/xr';
import { PhysicalXRPlane } from './PhysicalXRPlane';

export function Floors(props: GroupProps) {
	const planes = useXRPlanes('floor');

	return (
		<group {...props}>
			{planes.map((plane, index) => {
				return <Floor key={index} plane={plane} />;
			})}
		</group>
	);
}

export interface FloorProps {
	plane: XRPlane;
}

export function Floor({ plane }: FloorProps) {
	return <PhysicalXRPlane plane={plane} />;
}
