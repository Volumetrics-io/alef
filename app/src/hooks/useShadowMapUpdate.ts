import { useThree } from '@react-three/fiber';
import { useMemo } from 'react';

export const useShadowMapUpdate = () => {
	const gl = useThree((s) => s.gl);
	return () => {
		gl.shadowMap.needsUpdate = true;
	};
};

export function useShadowControls() {
	const gl = useThree((s) => s.gl);
	return useMemo(
		() => ({
			update: () => {
				gl.shadowMap.needsUpdate = true;
			},
			disable: () => {
				console.log('disabling shadows');
				gl.shadowMap.enabled = false;
				gl.shadowMap.needsUpdate = true;
			},
			enable: () => {
				console.log('enabling shadows');
				gl.shadowMap.enabled = true;
				gl.shadowMap.needsUpdate = true;
			},
		}),
		[gl]
	);
}
