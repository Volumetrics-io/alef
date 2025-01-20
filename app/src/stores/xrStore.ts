import { colors } from '@react-three/uikit-default';
import { createXRStore, XRStore } from '@react-three/xr';

export const xrStore: XRStore = createXRStore({
	depthSensing: true,
	bounded: false,
	hand: {
		// disabled since it triggers moving furniture if your hand just intersects
		// the furniture and can't be cancelled
		touchPointer: false,
		rayPointer: {
			rayModel: {
				color: (pointer) => (pointer.getButtonsDown().size > 0 ? 'hsl(240, 100%, 70%)' : 'white'),
				opacity: (pointer) => (pointer.getButtonsDown().size > 0 ? 1.0 : 0.4),
			},
			cursorModel: {
				color: colors.primary.value,
				opacity: (pointer) => (pointer.getButtonsDown().size > 0 ? 0.6 : 0.4),
			},
		},
		grabPointer: false,
		model: false,
	},
	controller: {
		rayPointer: {
			rayModel: {
				color: (pointer) => (pointer.getButtonsDown().size > 0 ? 'hsl(240, 100%, 70%)' : 'white'),
				opacity: (pointer) => (pointer.getButtonsDown().size > 0 ? 1.0 : 0.4),
			},
			cursorModel: {
				color: colors.primary.value,
				opacity: (pointer) => (pointer.getButtonsDown().size > 0 ? 0.6 : 0.4),
			},
		},
		teleportPointer: false,
		grabPointer: false,
		model: false,
	},
});
