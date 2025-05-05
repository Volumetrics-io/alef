import { useDrag } from '@use-gesture/react';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { defaultController } from './defaultController';
import { OnscreenButtonControl, OnscreenDevice, OnscreenStickControl } from './OnscreenDevice';

const onscreen = defaultController.devices.onscreen as OnscreenDevice;

let wasTouchEverDetected = false;
window.addEventListener('touchstart', () => {
	wasTouchEverDetected = true;
});

/**
 * Adaptive onscreen controls render interactive touch controls for
 * all of the configured control actions on the main controller.
 */
export function OnscreenControls() {
	const controls = useSyncExternalStore(
		(cb) => onscreen.subscribeOnControlsChanged(cb),
		() => onscreen.controls
	);

	const [wasTouchDetected, setWasTouchDetected] = useState(wasTouchEverDetected);
	useEffect(() => {
		if (wasTouchDetected) {
			return;
		}

		function flipTouchFlag() {
			setWasTouchDetected(true);
		}
		window.addEventListener('touchstart', flipTouchFlag);
		return () => {
			window.removeEventListener('touchstart', flipTouchFlag);
		};
	}, [wasTouchDetected]);

	if (!wasTouchDetected) {
		return null;
	}

	return (
		<div className="alef-onscreen-controls">
			{controls.map((control) => {
				if (control.type === 'button') {
					return <OnscreenButton key={control.key} control={control} />;
				}
				if (control.type === 'stick') {
					return <OnscreenStick key={control.xAxisKey} control={control} />;
				}
			})}
		</div>
	);
}

function OnscreenButton({ control }: { control: OnscreenButtonControl }) {
	return (
		<button
			className="alef-onscreen-button"
			style={{
				left: control.position.x * 100 + '%',
				top: control.position.y * 100 + '%',
				transform: 'translate(-50%, -50%)',
			}}
			onPointerDown={() => {
				onscreen.onButtonDown(control.key);
			}}
			onPointerUp={() => {
				onscreen.onButtonUp(control.key);
			}}
		>
			{control.label}
		</button>
	);
}

function OnscreenStick({ control }: { control: OnscreenStickControl }) {
	const thumbRef = useRef<HTMLDivElement>(null);

	const maxRadius = 50;
	useDrag(
		(state) => {
			const offsetX = state.last ? 0 : state.movement[0];
			const offsetY = state.last ? 0 : state.movement[1];
			const xPercent = offsetX / maxRadius;
			const yPercent = offsetY / maxRadius;
			const x = Math.max(-1, Math.min(1, xPercent));
			const y = Math.max(-1, Math.min(1, yPercent));
			onscreen.onAxisMove(control.xAxisKey, x);
			onscreen.onAxisMove(control.yAxisKey, y);
			if (thumbRef.current) {
				const mag = Math.sqrt(offsetX * offsetX + offsetY * offsetY) || 1;
				const cappedOffsetX = Math.sign(offsetX) * Math.min(Math.abs(offsetX), (Math.abs(offsetX) / mag) * maxRadius);
				const cappedOffsetY = Math.sign(offsetY) * Math.min(Math.abs(offsetY), (Math.abs(offsetY) / mag) * maxRadius);
				thumbRef.current.style.setProperty('--x', `${cappedOffsetX}px`);
				thumbRef.current.style.setProperty('--y', `${cappedOffsetY}px`);
			}
		},
		{
			target: thumbRef,
		}
	);
	return (
		<div
			className="alef-onscreen-stick"
			style={{
				left: control.position.x * 100 + '%',
				top: control.position.y * 100 + '%',
				transform: 'translate(-50%, -50%)',
			}}
		>
			<div className="alef-onscreen-stick__thumb" ref={thumbRef}>
				{control.label}
			</div>
		</div>
	);
}
