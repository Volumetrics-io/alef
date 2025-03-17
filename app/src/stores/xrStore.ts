import { getCursorColor, getRayColor } from '@/components/xr/ui/theme';
import { createXRStore, DefaultXRControllerOptions, DefaultXRHandOptions, XRStore } from '@react-three/xr';

const handConfig: DefaultXRHandOptions = {
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
};

const controllerConfig: DefaultXRControllerOptions = {
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
};

export const xrStore: XRStore = createXRStore({
	depthSensing: true,
	bounded: false,
	// emulate: false,
	hand: {
		left: handConfig,
		right: false,
	},
	controller: {
		left: controllerConfig,
		right: controllerConfig,
	},
});

export function setActivePointer(hand: XRHandedness) {
	if (hand === 'none') return;
	xrStore.setHand(handConfig, hand);
	xrStore.setHand(false, hand === 'left' ? 'right' : 'left');

	xrStore.setController(controllerConfig, hand);
	xrStore.setController(false, hand === 'left' ? 'right' : 'left');
}
