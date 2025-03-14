import { DEBUG } from '@/services/debug';
import { usePlanes } from '@/stores/roomStore';
import { useXR } from '@react-three/xr';
import { Quaternion } from 'three';
import { DemoPlane } from './DemoPlane';

export interface NonXRPlaneRendererProps {
	debug?: boolean;
}

export function NonXRPlaneRenderer({ debug = DEBUG }: NonXRPlaneRendererProps) {
	const planes = usePlanes();
	const isInSession = useXR((s) => !!s.session);

	if (isInSession && !debug) {
		return null;
	}

	if (!planes.length) {
		// TODO: default walls? ceiling?
		const quat = new Quaternion().setFromAxisAngle({ x: 0, y: 1, z: 0 }, 0);
		return <DemoPlane orientation={quat} center={{ x: 0, y: 0, z: 0 }} dimensions={[10, 10]} label="floor" />;
	}

	return (
		// when debugging, bring the planes in a tiny bit so they render over the actual walls.
		<group>
			{planes.map((plane, index) => {
				return <DemoPlane key={index} orientation={plane.orientation} center={plane.origin} dimensions={plane.extents} label={plane.label} />;
			})}
		</group>
	);
}
