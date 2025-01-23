import { animated, config, useSpring } from '@react-spring/three';
import { Billboard } from '@react-three/drei';
import { GroupProps, useFrame } from '@react-three/fiber';
import { useXR } from '@react-three/xr';
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Group, Vector3 } from 'three';
import { useCameraForward, useCameraOrigin } from '../../../hooks/useCameraOrigin.js';

const AnimatedGroup = animated('group');

export const BodyAnchor = forwardRef<Group, BodyAnchorProps>(({ position = [0, -0.2, -0.8], children, follow = false, lockY = false, distance = 0.2, ...groupProps }, ref) => {
	const immersive = useXR((xr) => xr.mode === 'immersive-ar');
	const isStabilized = useRef(true);
	const groupRef = useRef<Group>(new Group());
	const stopped = useRef(false);

	useImperativeHandle(ref, () => groupRef.current);

	// Reset stabilization when entering/exiting immersive mode
	useEffect(() => {
		if (follow) return;
		let stabilizationTimer: number;
		if (immersive) {
			isStabilized.current = false;
			stabilizationTimer = window.setTimeout(() => {
				isStabilized.current = true;
			}, 100); // Wait 100ms for XR camera to stabilize
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

	newPos.copy(getForward(Array.isArray(position) ? position[2] : position.z));
	cameraWorldPos.copy(getCameraPos());

	if (lockY && position) {
		const y = Array.isArray(position) ? position[1] : position.y;
		newPos.y = y + cameraWorldPos.y;
	}

	const [{ pos }, api] = useSpring<{ pos: [number, number, number] }>(() => ({
		pos: Array.isArray(position) ? [position[0], position[1], position[2]] : [position.x, position.y, position.z],
		config: config.molasses,
	}));

	// Sync spring position with groupRef when 'follow' is enabled
	useEffect(() => {
		if (follow && groupRef.current) {
			const { x, y, z } = groupRef.current.position;
			api.set({ pos: [x, y, z] });
		}
	}, [follow, api]);

	useFrame(() => {
		if (!isStabilized.current) {
			return;
		}
		if (!groupRef.current) return;
		newPos.copy(getForward(Array.isArray(position) ? position[2] : position.z));
		cameraWorldPos.copy(getCameraPos());

		if (lockY && position) {
			const y = Array.isArray(position) ? position[1] : position.y;
			newPos.y = y + cameraWorldPos.y;
		}

		currentPos.set(groupRef.current.position.x, groupRef.current.position.y, groupRef.current.position.z);

		if (!stopped.current && currentPos.distanceTo(newPos) > distance) {
			api.start({
				pos: [newPos.x, newPos.y, newPos.z],
			});
		}

		if (!follow && currentPos.distanceTo(newPos) < distance) {
			stopped.current = true;
		} else if (follow && stopped.current) {
			stopped.current = false;
		}
	});

	return (
		<AnimatedGroup ref={groupRef} position={pos} {...groupProps}>
			<Billboard>{children}</Billboard>
		</AnimatedGroup>
	);
});

export interface BodyAnchorProps extends GroupProps {
	position?: Vector3 | [number, number, number];
	children: React.ReactNode;
	lockY?: boolean;
	distance?: number;
	follow?: boolean;
}
