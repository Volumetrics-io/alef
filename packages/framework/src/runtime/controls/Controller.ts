export type BooleanActionValue = {
	type: 'boolean';
	value: boolean;
};

export type RangeActionValue = {
	type: 'range';
	value: number;
};

export type ActionValue = BooleanActionValue | RangeActionValue;
export type ActionType = ActionValue['type'];

export type Action = {
	name: string;
	value: ActionValue;
};

export type InputKey = string | number;
export type InputValue = boolean | number;

export type ControlBinding = {
	device: string;
	inputKey: InputKey;
};

const registerOnActivity = Symbol('@@private-registerOnActivity');

export abstract class Device<Keys extends InputKey = InputKey> {
	inputs = new Map<InputKey, InputValue>();
	/** Call when someone interacts with this device in any way. */
	protected onActivity: () => void = () => {};
	/** Maps action names to inputs on this device */
	bindings = new Map<string, InputKey[]>();

	constructor(public readonly name: string) {}

	[registerOnActivity](callback: () => void) {
		this.onActivity = callback;
	}

	/** Read device state and update inputs */
	abstract update(): void;

	protected bind<K extends Keys>(actionName: string, inputKey: K) {
		const bindingList = this.bindings.get(actionName) ?? [];
		this.bindings.set(actionName, [...bindingList, inputKey]);
		return this;
	}
	protected unbind<K extends Keys>(actionName: string, inputKey: K) {
		this.bindings.set(actionName, this.bindings.get(actionName)?.filter((key) => key !== inputKey) ?? []);
		return this;
	}
}

export class Controller {
	actions: Record<string, Action> = {};
	devices: Device[] = [];

	#activeDeviceIndex: number = 0;

	addDevice = <T extends Device>(device: T): T => {
		this.devices.push(device);
		device[registerOnActivity](this.#onDeviceActivity.bind(this, device));
		return device;
	};

	addAction = (action: Action) => {
		if (this.actions[action.name]) {
			if (this.actions[action.name].value.type !== action.value.type) {
				throw new Error('You already defined that action with a different value type');
			}
			return this;
		}
		this.actions[action.name] = action;
		return this;
	};

	addBoolean = (name: string) => {
		return this.addAction({
			name,
			value: {
				type: 'boolean',
				value: false,
			},
		});
	};

	addRange = (name: string) => {
		return this.addAction({
			name,
			value: {
				type: 'range',
				value: 0,
			},
		});
	};

	getValue = (name: string) => {
		const action = this.actions[name];
		if (!action) {
			throw new Error(`No action named ${name}`);
		}
		return action.value.value;
	};

	#cachedVector = { x: 0, y: 0 };
	getVector2 = (xName: string, yName: string) => {
		const xAction = this.actions[xName];
		if (!xAction) {
			throw new Error(`No action named ${xName}`);
		}
		const yAction = this.actions[yName];
		if (!yAction) {
			throw new Error(`No action named ${yName}`);
		}
		this.#cachedVector.x = Number(xAction.value.value);
		this.#cachedVector.y = Number(yAction.value.value);
		return this.#cachedVector;
	};

	#onDeviceActivity = (device: Device) => {
		this.#activeDeviceIndex = this.devices.indexOf(device);
	};

	update = () => {
		this.devices.forEach((device) => device.update());
		const activeDevice = this.devices[this.#activeDeviceIndex];
		if (!activeDevice) {
			return;
		}

		for (const [actionName, inputKeys] of activeDevice.bindings) {
			for (const inputKey of inputKeys) {
				const inputValue = activeDevice.inputs.get(inputKey);
				if (inputValue === undefined) {
					continue;
				}

				const action = this.actions[actionName];
				if (!action) {
					continue;
				}

				if (action.value.type === 'boolean') {
					action.value.value = !!inputValue;
				} else if (action.value.type === 'range') {
					action.value.value = Number(inputValue);
				}
			}
		}
	};
}
