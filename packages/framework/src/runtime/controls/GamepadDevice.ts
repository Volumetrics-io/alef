import { Device } from './Controller';

export class GamepadDevice extends Device<`button:${number}` | `axis:${number}`> {
	#deviceIndex: number | null = null;
	#device: Gamepad | null = null;
	#lastSeen: number = 0;
	#deadzones: number[] = new Array(100).fill(0.05);

	constructor() {
		super('gamepad');
		window.addEventListener('gamepadconnected', this.#onGamepadConnected);
		window.addEventListener('gamepaddisconnected', this.#onGamepadDisconnected);
	}

	#buttonKey = (buttonIndex: number): `button:${number}` => {
		return `button:${buttonIndex}`;
	};
	#axisKey = (axisIndex: number): `axis:${number}` => {
		return `axis:${axisIndex}`;
	};

	bindButton = (action: string, index: number) => {
		this.bind(action, this.#buttonKey(index));
		return this;
	};

	bindAxis = (action: string, index: number) => {
		this.bind(action, this.#axisKey(index));
		return this;
	};

	setAxisDeadzone = (axisIndex: number, size: number) => {
		this.#deadzones[axisIndex] = size;
		return this;
	};

	update() {
		this.#device = navigator.getGamepads()[this.#deviceIndex ?? 0];
		if (!this.#device) {
			console.debug('no gamepad detected at index', this.#deviceIndex);
			return;
		}

		let nonDeadzoneActivity = false;

		for (let i = 0; i < this.#device.buttons.length; i++) {
			const button = this.#device.buttons[i];
			this.inputs.set(this.#buttonKey(i), button.pressed);
			nonDeadzoneActivity = true;
		}
		for (let i = 0; i < this.#device.axes.length; i++) {
			let axis = this.#device.axes[i];
			if (this.#deadzones[i] !== undefined && Math.abs(axis) < this.#deadzones[i]) {
				axis = 0;
			} else {
				nonDeadzoneActivity = true;
			}
			this.inputs.set(this.#axisKey(i), axis);
		}

		if (nonDeadzoneActivity && this.#device.timestamp > this.#lastSeen) {
			this.#lastSeen = this.#device.timestamp;
			this.onActivity();
		}
	}

	#onGamepadConnected = (event: GamepadEvent) => {
		console.debug('gamepad connected', event.gamepad.index);
		this.#deviceIndex = event.gamepad.index;
	};

	#onGamepadDisconnected = (event: GamepadEvent) => {
		console.debug('gamepad disconnected', event.gamepad.index);
		if (this.#deviceIndex === event.gamepad.index) {
			this.#deviceIndex = null;
		}
	};
}
