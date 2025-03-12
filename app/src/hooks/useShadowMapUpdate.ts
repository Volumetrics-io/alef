import { useThree } from '@react-three/fiber';

export const useShadowMapUpdate = () => {
	const { gl } = useThree();
	return () => {
		gl.shadowMap.needsUpdate = true;
	};
};
