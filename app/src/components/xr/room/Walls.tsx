import { GroupProps } from '@react-three/fiber';
import { NotInXR, useXRPlanes } from '@react-three/xr';
import { DemoPlane } from './DemoPlane';
import { PhysicalXRPlane } from './PhysicalXRPlane';

export function Walls(props: GroupProps) {
	const planes = useXRPlanes('wall');
	return (
		<group {...props}>
			{planes.map((plane, index) => {
				return <Wall key={index} plane={plane} />;
			})}
			<NotInXR>
				{/* default walls */}
				<DemoPlane label="wall" normal={[1, 0, 0]} center={[-5, 5, 0]} dimensions={[10, 10]} debug />
				<DemoPlane label="wall" normal={[0, 0, 1]} center={[0, 5, -5]} dimensions={[10, 10]} debug />
			</NotInXR>
		</group>
	);
}

export interface WallProps {
	plane: XRPlane;
}

export function Wall({ plane }: WallProps) {
	return <PhysicalXRPlane plane={plane} debug />;
}
