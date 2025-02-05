import { useCallback } from 'react';
import { useCameraForward, useCameraOrigin } from './useCameraOrigin';

export function usePositionInFrontOfUser() {
	const getForward = useCameraForward();
	const getPosition = useCameraOrigin();
	return useCallback(
		(distance = 1) => {
			return getPosition().add(getForward().multiplyScalar(distance));
		},
		[getForward, getPosition]
	);
}
