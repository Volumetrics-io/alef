import { useThree } from '@react-three/fiber';

export const useShadowMapUpdate = () => {
	const gl = useThree((s) => s.gl);
	return () => {
		gl.shadowMap.needsUpdate = true;
	};
};
