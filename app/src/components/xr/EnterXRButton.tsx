import { xrStore } from '@/stores/xrStore.js';
import { useSessionModeSupported } from '@react-three/xr';
import { useSyncExternalStore } from 'react';

export function EnterXRButton() {
	const isInXR = useSyncExternalStore(
		(update) =>
			xrStore.subscribe((state, prev) => {
				if (!!state.session !== !!prev.session) {
					update();
				}
			}),
		() => !!xrStore.getState().session
	);

	const supportsAR = useSessionModeSupported('immersive-ar');
	const supportsVR = useSessionModeSupported('immersive-vr');

	const mode = supportsAR ? 'immersive-ar' : supportsVR ? 'immersive-vr' : null;

	const toggleSession = () => {
		if (!mode) return;

		const session = xrStore.getState().session;
		if (session) {
			session.end();
		} else {
			xrStore.enterXR(mode);
		}
	};

	const modeLabel = mode === 'immersive-ar' ? 'AR' : 'VR';

	if (!mode) {
		return null;
	}

	return (
		<button id="EnterButton" onClick={() => toggleSession()}>
			{isInXR ? 'Exit' : 'Enter'} {modeLabel}
		</button>
	);
}
