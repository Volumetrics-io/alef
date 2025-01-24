import { GroupProps } from '@react-three/fiber';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { NotInXR, useXRPlanes } from '@react-three/xr';
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
				<RigidBody type="fixed" colliders={false}>
					<CuboidCollider args={[100, 0, 100]} />
				</RigidBody>
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
