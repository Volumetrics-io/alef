import { useXR, useXRPlanes } from '@react-three/xr';

const sessionRescannedMap = new WeakMap<XRSession, boolean>();

export function useRescanRoom() {
	const session = useXR((s) => s.session);

	const rescanRoom = () => {
		if (!session) return;
		// sessions may only be rescanned once
		if (sessionRescannedMap.get(session)) return;
		session.initiateRoomCapture?.();
		sessionRescannedMap.set(session, true);
	};

	const canRescan = session && !sessionRescannedMap.get(session);
	return { canRescan, rescanRoom };
}

export function useNeedsRoomScan() {
	const session = useXR((s) => s.session);
	const canRescan = session && !sessionRescannedMap.get(session);
	// if we don't have walls, we need a rescan
	const walls = useXRPlanes('wall');
	return walls.length === 0 && canRescan;
}
