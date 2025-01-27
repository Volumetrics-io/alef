import { GroupProps } from '@react-three/fiber';
import { useXR, useXRPlanes } from '@react-three/xr';
import { DemoPlane } from './DemoPlane';
import { PhysicalXRPlane } from './PhysicalXRPlane';
export function Floors(props: GroupProps) {
	const planes = useXRPlanes('floor');
	const isInSession = useXR((s) => !!s.session);

	return (
		<group {...props}>
			{planes.map((plane, index) => {
				return <Floor key={index} plane={plane} />;
			})}
			{!isInSession && (
				<>
					{/* default floor plane */}
					<DemoPlane label="floor" normal={[0, 1, 0]} center={[0, 0, 0]} dimensions={[10, 10]} debug />
				</>
			)}
		</group>
	);
}

export interface FloorProps {
	plane: XRPlane;
}

export function Floor({ plane }: FloorProps) {
	return <PhysicalXRPlane plane={plane} />;
}
