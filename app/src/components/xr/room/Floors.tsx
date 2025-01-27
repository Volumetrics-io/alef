import { GroupProps } from '@react-three/fiber';
import { NotInXR, useXRPlanes } from '@react-three/xr';
import { DemoPlane } from './DemoPlane';
import { PhysicalXRPlane } from './PhysicalXRPlane';
export function Floors(props: GroupProps) {
	const planes = useXRPlanes('floor');

	return (
		<group {...props}>
			{planes.map((plane, index) => {
				return <Floor key={index} plane={plane} />;
			})}
			<NotInXR>
				{/* default floor plane */}
				<DemoPlane label="floor" normal={[0, 1, 0]} center={[0, 0, 0]} dimensions={[10, 10]} debug />
			</NotInXR>
		</group>
	);
}

export interface FloorProps {
	plane: XRPlane;
}

export function Floor({ plane }: FloorProps) {
	return <PhysicalXRPlane plane={plane} />;
}
