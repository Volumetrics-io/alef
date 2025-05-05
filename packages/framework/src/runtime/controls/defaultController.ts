import { Controller } from './Controller';
import { GamepadDevice } from './GamepadDevice';
import { KeyboardDevice } from './KeyboardDevice';
import { OnscreenDevice } from './OnscreenDevice';

export const defaultController = new Controller();

defaultController.addDevice(new KeyboardDevice());
defaultController.addDevice(new GamepadDevice(0));
defaultController.addDevice(new GamepadDevice(1));
defaultController.addDevice(new GamepadDevice(2));
defaultController.addDevice(new GamepadDevice(3));
defaultController.addDevice(new OnscreenDevice());
