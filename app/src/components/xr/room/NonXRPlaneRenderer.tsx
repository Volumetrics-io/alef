import { usePlanes } from '@/stores/roomStore';
import { useXR } from '@react-three/xr';
import { Quaternion } from 'three';
import { DemoPlane } from './DemoPlane';

export interface NonXRPlaneRendererProps {}

export function NonXRPlaneRenderer({}: NonXRPlaneRendererProps) {
	const planes = usePlanes();
	const isInSession = useXR((s) => !!s.session);

	if (isInSession) {
		return null;
	}

	if (!planes.length) {
		// TODO: default walls? ceiling?
		const quat = new Quaternion().setFromAxisAngle({ x: 0, y: 1, z: 0 }, 0);
		return <DemoPlane orientation={quat} center={{ x: 0, y: 0, z: 0 }} dimensions={[10, 10]} label="floor" />;
	}

	return (
		<>
			{planes.map((plane, index) => {
				return <DemoPlane id={plane.id} key={index} orientation={plane.orientation} center={plane.origin} dimensions={plane.extents} label={plane.label} />;
			})}
		</>
	);
}
