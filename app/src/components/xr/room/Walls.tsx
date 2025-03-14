import { GroupProps } from '@react-three/fiber';
import { useXRPlanes } from '@react-three/xr';
import { PhysicalXRPlane } from './PhysicalXRPlane';

export function Walls(props: GroupProps) {
	const planes = useXRPlanes('wall');

	return (
		<group {...props}>
			{planes.map((plane, index) => {
				return <Wall key={index} plane={plane} />;
			})}
		</group>
	);
}

export interface WallProps {
	plane: XRPlane;
}

export function Wall({ plane }: WallProps) {
	return <PhysicalXRPlane plane={plane} />;
}
