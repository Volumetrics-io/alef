import { animated, useSpring, config } from '@react-spring/three';
import { Vector3 } from 'three';
import { useCameraOrigin, useCameraForward } from '../../../hooks/useCameraOrigin.js';
import React from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '../Billboard.js';
import { useXR } from '@react-three/xr';
import { useEffect, useRef } from 'react';

export function BodyAnchor({
	position = [0, -0.2, -0.8],
	children,
	follow = false,
	lockY = false,
	distance = 0.2,
}: {
	position?: Vector3 | [number, number, number];
	children: React.ReactNode;
	lockY?: boolean;
	distance?: number;
	follow?: boolean;
}) {
	const immersive = useXR((xr) => xr.mode == 'immersive-ar');
	const isStabilized = useRef(true);

	// Reset stabilization when entering/exiting immersive mode
	useEffect(() => {
		if (follow) return;
		let stabilizationTimer: number;
		if (immersive) {
			isStabilized.current = false;
			stabilizationTimer = setTimeout(() => {
				isStabilized.current = true;
			}, 100); // Wait 500ms for XR camera to stabilize
		}
		return () => {
			if (stabilizationTimer) {
				clearTimeout(stabilizationTimer);
			}
		};
	}, [immersive, follow]);

	const cameraWorldPos = new Vector3();
	const getForward = useCameraForward();
	const getCameraPos = useCameraOrigin();

	const currentPos = new Vector3();
	const newPos = new Vector3();

	newPos.copy(getForward());
	cameraWorldPos.copy(getCameraPos());

	if (lockY && position) {
		newPos.y = position[1] + cameraWorldPos.y;
	}

	const [{ pos }, api] = useSpring<{ pos: [number, number, number] }>(() => ({
		pos: Array.isArray(position) ? [position[0], position[1], position[2]] : [position.x, position.y, position.z],
		config: config.molasses,
	}));

	useFrame(() => {
		if (!follow && isStabilized.current) {
			return;
		}
		newPos.copy(getForward());
		cameraWorldPos.copy(getCameraPos());

		if (lockY && position) {
			newPos.y = position[1] + cameraWorldPos.y;
		}

		currentPos.set(pos.get()[0], pos.get()[1], pos.get()[2]);

		if (currentPos.distanceTo(newPos) > distance) {
			api.start({
				pos: [newPos.x, newPos.y, newPos.z],
			});
		}
	});

	return (
		<animated.group position={follow ? pos : newPos}>
			<Billboard>{children}</Billboard>
		</animated.group>
	);
}
