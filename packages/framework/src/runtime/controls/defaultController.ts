import { Controller } from './Controller';
import { GamepadDevice } from './GamepadDevice';
import { KeyboardDevice } from './KeyboardDevice';
import { OnscreenDevice } from './OnscreenDevice';

export const defaultController = new Controller();

const keyboard = defaultController.addDevice(new KeyboardDevice());
const gamepad = defaultController.addDevice(new GamepadDevice());
const onscreen = defaultController.addDevice(new OnscreenDevice());

export const devices = {
	keyboard,
	gamepad,
	onscreen,
};
