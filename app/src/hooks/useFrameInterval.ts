import { RenderCallback, useFrame } from '@react-three/fiber';
import { useRef } from 'react';

/**
 * A useFrame that calls the given callback _roughly_ at the given
 * interval instead of every frame.
 */
export function useFrameInterval(cb: RenderCallback, intervalMs: number) {
	const elapsed = useRef(0);
	useFrame((...args) => {
		elapsed.current += args[1] * 1000;
		if (elapsed.current >= intervalMs) {
			cb(...args);
			elapsed.current = elapsed.current % intervalMs;
		}
	});
}
