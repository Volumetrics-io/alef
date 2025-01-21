import { PointerEvent } from '@pmndrs/pointer-events';
import { isXRInputSourceState, useHover } from '@react-three/xr';
import { useRef } from 'react';
import { Group } from 'three';

export function useVibrateOnHover() {
	const groupRef = useRef<Group>(null);

	// @ts-expect-error - idk why pointer event handlers aren't added properly to Object3D
	useHover(groupRef, (hover: boolean, e: PointerEvent) => {
		if (hover) {
			if (isXRInputSourceState(e.pointerState) && e.pointerState.type === 'controller') {
				e.pointerState.inputSource.gamepad?.hapticActuators[0]?.pulse(0.3, 50);
			}
		}
	});

	return groupRef;
}
