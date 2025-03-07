import { GroupProps } from '@react-three/fiber';
import { useXR, useXRPlanes } from '@react-three/xr';
import { PhysicalXRPlane } from './PhysicalXRPlane';
export function Floors(props: GroupProps) {
	const planes = useXRPlanes('floor');
	const isInSession = useXR((s) => !!s.session);

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
