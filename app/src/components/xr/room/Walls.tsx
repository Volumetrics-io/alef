import { GroupProps } from '@react-three/fiber';
import { useXR, useXRPlanes } from '@react-three/xr';
import { DemoPlane } from './DemoPlane';
import { PhysicalXRPlane } from './PhysicalXRPlane';

export function Walls(props: GroupProps) {
	const planes = useXRPlanes('wall');
	const isInSession = useXR((s) => !!s.session);
	return (
		<group {...props}>
			{planes.map((plane, index) => {
				return <Wall key={index} plane={plane} />;
			})}
			{!isInSession && (
				<>
					{/* default walls */}
					<DemoPlane label="wall" normal={[1, 0, 0]} center={[-5, 5, 0]} dimensions={[10, 10]} debug />
					<DemoPlane label="wall" normal={[0, 0, 1]} center={[0, 5, -5]} dimensions={[10, 10]} debug />
				</>
			)}
		</group>
	);
}

export interface WallProps {
	plane: XRPlane;
}

export function Wall({ plane }: WallProps) {
	return <PhysicalXRPlane plane={plane} debug />;
}
