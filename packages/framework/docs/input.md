# The Alef runtime input system

This documentation explains how to use the runtime player input system in Alef.

## Concepts

The runtime input system contains several concepts:

- _Action_: this is a named action a player can take in a game, regardless of what input they use to perform it. Actions come in two forms: **boolean** and **range**. **Boolean** actions are booleans that represent discrete on/off actions, like "is jumping." **Range** actions are floating point numbers that represent continuous values, like "horizontal movement."
- _Device_: this is a physical input device, like a keyboard, a game controller, or a touchscreen. _Devices* have input *Keys_ which identify the different kinds of physical inputs they provide to the user.
- _Binding_: A connection made by the game creator or the user between a _Device_'s _Key_ and an _Action_. For example, "bind the Keyboard's Spacebar to Jump" binds the "Spacebar" _Key_ on the Keyboard _Device_ to the Jump _Action_.
- _Controller_: this is an abstract representation of player controls which ties together concrete _Devices_ and binds their physical inputs to _Actions_. It manages the connected _Devices_, processes their input _Keys_, and utilizes _Bindings_ to activate the appropriate _Actions_.

## Making a controller

To begin, you need a Controller. Alef provides a default controller for you which is already connected to the Keyboard, Gamepad, and Onscreen (touch screen) devices.

```js
import { defaultController } from '@alef/framework/runtime';
```

## Defining actions

You define _Actions* on your controller with `addBoolean` and `addRange`. Give each *Action_ a unique string name that has meaning within your game.

```js
controller.addBoolean('jump').addRange('move-x').addRange('move-y');
```

## Setting up the control bindings

Each _Device_ behaves a little bit differently, so you must configure each one individually to bind the correct keys to the actions you want.

You can access the _Devices_ to bind controls using `Controller#devices[name]`. Each device has an assigned name (`Device#name`), see below sections.

By convention, binding methods take the name of the bound _Action_(s) first, then the _Key_(s) they are bound to.

### Keyboard bindings

The Keyboard device always has the name `keyboard` and is accessible on `controller.devices.keyboard`.

To bind actions to keyboard keys, you have two options: `bindKey` and `bindAxis`. Input _Key_ values correspond to `KeyboardEvent.key` values, i.e. the A key is `a`, the left arrow key is `ArrowLeft`, and the spacebar is ` `.

`bindKey` produces a boolean value for a single _Action_.

```js
controller.devices.keyboard.bindKey('jump', ' ');
```

`bindAxis` binds two keys into one range `Action`, from -1 to +1. The first key is the negative, the second key is positive.

```js
controller.devices.keyboard.bindAxis('move-x', 'a', 'd');
```

### Gamepad bindings

Since multiple gamepads can be connected, each one is represented by a different device. Gamepad devices are named after their controller 0-based index: `gamepad0`, `gamepad1`, `gamepad2`... and so on.

The default Alef controller instance comes with support for 4 gamepads.

To bind gamepad controls, use `bindButton` and `bindAxis`. Gamepad input _Keys_ are indexes which correspond to the button and axis indexes of the web Gamepad API.

`bindButton` produces a boolean value for a single _Action_.

```js
controller.devices.gamepad0.bindButton('shoot', 0);
```

`bindAxis` produces a range value from -1 to +1.

```js
controller.devices.gamepad0.bindAxis('move-y', 1);
```

In addition to binding, the Gamepad _Device_ also lets you customize axis deadzones. The first parameter is the gamepad's axis index, the second is a 'deadzone' value (in percentage points) which acts as a lower bound cutoff for input. Input values with smaller absolute magnitude than this value will be turned into 0. Deadzones are commonly used to reduce "stick drift" when physical input devices like joysticks report extremely small values when at rest.

```js
controller.devices.gamepad0.setAxisDeadzone(0, 0.05);
```

### Onscreen bindings

The Onscreen touch controller _Device_ is special, in that it allows you to dynamically create onscreen controls to bind to rather than providing any preset _Keys_. These virtual inputs can be either buttons or two-axis sticks.

Binding methods on `OnscreenDevice` accept a customization object which defines where the virtual touch input will be positioned onscreen (in percentages, 0.0-1.0) and what label, if any, is applied to it.

`bindButton` adds a button to the screen and binds it to an _Action_.

```js
controller.devices.onscreen.bindButton('jump', {
	label: 'A',
	key: 'a',
	position: { x: 0.9, y: 0.8 },
});
```

`bindStick` adds a 2-direction touch joystick to the screen and binds its two axes to two _Actions_.

```js
controller.devices.onscreen.bindStick('move-x', 'move-y', {
	xAxisKey: 'left-stick-x',
	yAxisKey: 'left-stick-y',
	position: { x: 0.1, y: 0.9 },
});
```

## Local multiplayer

To properly bind controls for games that support local multiplayer, _Actions_ should be separated by player identity. For example: `p0_move-x` and `p1_move-x` represent _Actions_ corresponding to X movement for player 0 and player 1, respectively.

These _Actions_ can then be bound to different input _Keys_ such that each player has distinct inputs to use for their actions. For example, when playing on one keyboard, perhaps `A/D` are bound to `p0_move-x`, and `ArrowLeft/ArrowRight` are bound to `p1_move-x`. When using gamepads, you would bind player 0's actions to `gamepad0` and player 1's actions to `gamepad1`, etc.
