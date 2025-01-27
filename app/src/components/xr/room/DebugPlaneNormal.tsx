import { usePlanesStore } from '@/stores/planesStore';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { ArrowHelper, Vector3 } from 'three';

export interface DebugPlaneNormalProps {
	plane: XRPlane;
}

export function DebugPlaneNormal({ plane }: DebugPlaneNormalProps) {
	const getStuff = usePlanesStore((s) => s.getPlaneInfo);
	const initial = getStuff(plane) ?? { center: new Vector3(), normal: new Vector3() };

	const ref = useRef<ArrowHelper>(null);
	useFrame(() => {
		const stuff = getStuff(plane);
		if (!stuff) return;
		const { normal, center } = stuff;
		ref.current?.setDirection(normal);
		ref.current?.position.copy(center);
	});

	return <arrowHelper ref={ref} args={[initial.normal, initial.center, 0.5, 0x00ff90]} />;
}
