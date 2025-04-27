import { Device, InputKey } from './Controller';

type KeyProcessor = {
	(pressed: boolean): boolean | number;
	input: InputKey;
};

const negativeAxis = (inputKey: string): KeyProcessor => {
	function process(pressed: boolean) {
		return pressed ? -1 : 0;
	}
	process.input = inputKey;
	return process;
};
const positiveAxis = (inputKey: string): KeyProcessor => {
	function process(pressed: boolean) {
		return pressed ? 1 : 0;
	}
	process.input = inputKey;
	return process;
};
const button = (inputKey: string): KeyProcessor => {
	function process(pressed: boolean) {
		return pressed;
	}
	process.input = inputKey;
	return process;
};

export class KeyboardDevice extends Device<string> {
	#processors = new Map<string, KeyProcessor>();
	constructor() {
		super('keyboard');
		window.addEventListener('keydown', this.#onKeyDown);
		window.addEventListener('keyup', this.#onKeyUp);
	}

	update() {}

	bindKey = (action: string, key: string) => {
		this.bind(action, key);
		this.#processors.set(key, button(key));
		return this;
	};

	bindAxis = (action: string, negativeKey: string, positiveKey: string) => {
		const input = `${negativeKey}/${positiveKey}`;
		this.bind(action, input);
		this.#processors.set(negativeKey, negativeAxis(input));
		this.#processors.set(positiveKey, positiveAxis(input));
		return this;
	};

	#onKeyDown = (event: KeyboardEvent) => {
		const processor = this.#processors.get(event.key);
		if (processor) {
			this.inputs.set(processor.input, processor(true));
			this.onActivity();
		}
	};

	#onKeyUp = (event: KeyboardEvent) => {
		const processor = this.#processors.get(event.key);
		if (processor) {
			this.inputs.set(processor.input, processor(false));
			this.onActivity();
		}
	};
}
