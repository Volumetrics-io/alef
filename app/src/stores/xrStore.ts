import { createXRStore, XRStore } from '@react-three/xr';
import { colors } from '@react-three/uikit-default';

export const xrStore: XRStore = createXRStore({
	depthSensing: true,
	bounded: false,
	hand: {
		touchPointer: false,
		grabPointer: false,
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
		model: false,
	},
	controller: {
		teleportPointer: false,
		grabPointer: false,
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
		model: false,
	},
});
