import { setActivePointer } from '@/stores/xrStore';
import { useXR } from '@react-three/xr';
export const ActivePointer = () => {
	const { session } = useXR();

	if (!session) return null;

	session.addEventListener('select', (e: XRInputSourceEvent) => {
		setActivePointer(e.inputSource.handedness);
	});
};
