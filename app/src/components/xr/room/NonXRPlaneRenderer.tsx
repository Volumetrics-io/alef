import { DEBUG } from '@/services/debug';
import { usePlanes } from '@/stores/roomStore';
import { useXR } from '@react-three/xr';
import { Quaternion } from 'three';
import { RoomPlane } from './RoomPlane';

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
		return <RoomPlane plane={{ orientation: quat, origin: { x: 0, y: 0, z: 0 }, extents: [10, 10], label: 'floor', id: 'rp-default-floor' }} />;
	}

	return (
		<group>
			{planes.map((plane) => {
				return <RoomPlane key={plane.id} plane={plane} />;
			})}
		</group>
	);
}
