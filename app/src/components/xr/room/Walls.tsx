import { xrPlaneToRoomPlaneData } from '@/physics/xrPlaneTools';
import { usePlanesUpdatedAt, useUpdatePlanes } from '@/stores/roomStore';
import { GroupProps, useFrame } from '@react-three/fiber';
import { useXR, useXRPlanes } from '@react-three/xr';
import { DemoPlane } from './DemoPlane';
import { PhysicalXRPlane } from './PhysicalXRPlane';

export function Walls(props: GroupProps) {
	const planes = useXRPlanes('wall');
	const isInSession = useXR((s) => !!s.session);

	useUpdateWallsIfNeeded(planes, isInSession);

	return (
		<group {...props}>
			{planes.map((plane, index) => {
				return <Wall key={index} plane={plane} />;
			})}
			{!isInSession && (
				<>
					{/* default walls */}
					<DemoPlane label="wall" normal={[1, 0, 0]} center={[-5, 5, 0]} dimensions={[10, 10]} debug={location.search.includes('debug')} />
					<DemoPlane label="wall" normal={[0, 0, 1]} center={[0, 5, -5]} dimensions={[10, 10]} debug={location.search.includes('debug')} />
				</>
			)}
		</group>
	);
}

export interface WallProps {
	plane: XRPlane;
}

export function Wall({ plane }: WallProps) {
	return <PhysicalXRPlane plane={plane} debug={location.search.includes('debug')} />;
}

/** Update the backend's room walls if they are not already set */
function useUpdateWallsIfNeeded(planes: readonly XRPlane[], isInSession: boolean) {
	const planesUpdatedAt = usePlanesUpdatedAt();
	const updatePlanes = useUpdatePlanes();
	const referenceSpace = useXR((s) => s.originReferenceSpace);
	useFrame((_, __, xrFrame: XRFrame) => {
		if (!isInSession) return;
		const planesAreOld = planesUpdatedAt === null || Date.now() - planesUpdatedAt > 1000 * 60 * 60; /* One hour */
		if (!planesAreOld) return;
		if (!referenceSpace) return;
		const asRoomPlanes = planes.map((plane) => xrPlaneToRoomPlaneData(xrFrame, referenceSpace, plane));
		updatePlanes(asRoomPlanes);
	});
}
