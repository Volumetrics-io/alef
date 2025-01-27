import { PointerEvent } from '@pmndrs/pointer-events';
import { isXRInputSourceState, useHover } from '@react-three/xr';
import { RefObject } from 'react';
import { Object3D } from 'three';

export function useVibrateOnHover<Target extends Object3D>(groupRef: RefObject<Target | null>) {
	useHover(groupRef, (hover: boolean, e: PointerEvent) => {
		if (hover) {
			if (isXRInputSourceState(e.pointerState) && e.pointerState.type === 'controller') {
				e.pointerState.inputSource.gamepad?.hapticActuators[0]?.pulse(0.3, 50);
			}
		}
	});
}
