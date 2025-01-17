import { animated, config, useSpring } from '@react-spring/three';
import { useFrame } from '@react-three/fiber';
import { useXR } from '@react-three/xr';
import React, { useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import { useCameraForward, useCameraOrigin } from '../../../hooks/useCameraOrigin.js';
import { Billboard } from '../Billboard.js';

const AnimatedGroup = animated('group');

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
		const y = Array.isArray(position) ? position[1] : position.y;
		newPos.y = y + cameraWorldPos.y;
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
			const y = Array.isArray(position) ? position[1] : position.y;
			newPos.y = y + cameraWorldPos.y;
		}

		currentPos.set(pos.get()[0], pos.get()[1], pos.get()[2]);

		if (currentPos.distanceTo(newPos) > distance) {
			api.start({
				pos: [newPos.x, newPos.y, newPos.z],
			});
		}
	});

	return (
		<AnimatedGroup position={follow ? pos : newPos}>
			<Billboard>{children}</Billboard>
		</AnimatedGroup>
	);
}
