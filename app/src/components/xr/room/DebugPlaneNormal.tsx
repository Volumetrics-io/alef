import { usePlanesStore } from '@/stores/planesStore';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { ArrowHelper, Vector3 } from 'three';

export interface DebugPlaneNormalProps {
	planeId: string;
}

export function DebugPlaneNormal({ planeId }: DebugPlaneNormalProps) {
	const getStuff = usePlanesStore((s) => s.getPlaneInfo);
	const initial = getStuff(planeId) ?? { center: new Vector3(), normal: new Vector3() };

	const ref = useRef<ArrowHelper>(null);
	useFrame(() => {
		const stuff = getStuff(planeId);
		if (!stuff) return;
		const { normal, center } = stuff;
		ref.current?.setDirection(normal);
		ref.current?.position.copy(center);
	});

	return <arrowHelper ref={ref} args={[initial.normal, initial.center, 0.5, 0x00ff90]} />;
}
