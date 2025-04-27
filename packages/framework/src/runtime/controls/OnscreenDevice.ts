import { Device } from './Controller';

export type OnscreenButtonControl = {
	type: 'button';
	label: string;
	key: string;
	position: { x: number; y: number };
};
export type OnscreenStickControl = {
	type: 'stick';
	label?: string;
	xAxisKey: string;
	yAxisKey: string;
	position: { x: number; y: number };
};
export type OnscreenControl = OnscreenButtonControl | OnscreenStickControl;

export class OnscreenDevice extends Device {
	controls = new Array<OnscreenControl>();
	#controlsChanged: () => void = () => {};

	constructor() {
		super('onscreen');
	}

	update() {}

	addControl(control: OnscreenControl) {
		this.controls = [...this.controls, control];
		this.#controlsChanged();
	}

	bindButton = (action: string, button: Omit<OnscreenButtonControl, 'type'>) => {
		const control = {
			type: 'button' as const,
			...button,
		};
		this.addControl(control);
		this.bind(action, button.key);
		return this;
	};

	bindStick = (xAxisAction: string, yAxisAction: string, stick: Omit<OnscreenStickControl, 'type'>) => {
		const control = {
			type: 'stick' as const,
			...stick,
		};
		this.addControl(control);
		this.bind(xAxisAction, stick.xAxisKey);
		this.bind(yAxisAction, stick.yAxisKey);
		return this;
	};

	subscribeOnControlsChanged(callback: () => void) {
		this.#controlsChanged = callback;
		return () => {
			this.#controlsChanged = () => {};
		};
	}

	onButtonDown(key: string) {
		this.inputs.set(key, true);
		this.onActivity();
	}

	onButtonUp(key: string) {
		this.inputs.set(key, false);
		this.onActivity();
	}

	onAxisMove(key: string, value: number) {
		this.inputs.set(key, value);
		this.onActivity();
	}
}
