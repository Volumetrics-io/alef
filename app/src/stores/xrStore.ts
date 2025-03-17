import { getCursorColor, getRayColor } from '@/components/xr/ui/theme';
import { createXRStore, XRStore } from '@react-three/xr';

export const xrStore: XRStore = createXRStore({
	depthSensing: true,
	bounded: false,
	// emulate: false,
	hand: {
		// disabled since it triggers moving furniture if your hand just intersects
		// the furniture and can't be cancelled
		touchPointer: false,
		rayPointer: {
			rayModel: {
				color: (pointer) => getRayColor(pointer.getButtonsDown().size > 0),
				opacity: 0.4,
			},
			cursorModel: {
				color: (pointer) => getCursorColor(pointer.getButtonsDown().size > 0),
				opacity: 0.8,
			},
		},
		grabPointer: false,
		model: false,
	},
	controller: {
		rayPointer: {
			rayModel: {
				color: (pointer) => getRayColor(pointer.getButtonsDown().size > 0),
				opacity: 0.4,
			},
			cursorModel: {
				color: (pointer) => getCursorColor(pointer.getButtonsDown().size > 0),
				opacity: 0.8,
			},
		},
		teleportPointer: false,
		grabPointer: false,
		model: false,
	},
});
