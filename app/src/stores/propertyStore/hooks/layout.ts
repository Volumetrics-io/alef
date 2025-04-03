import { PrefixedId, RoomPlaneData } from '@alef/common';
import { useShallow } from 'zustand/react/shallow';
import { useRoomApi, useRoomState } from './rooms.js';

export function useRoomLayoutIds() {
	return useRoomState(useShallow((s) => Object.keys(s.layouts) as PrefixedId<'rl'>[]));
}

export function useRoomLayout(id: PrefixedId<'rl'>) {
	return useRoomState((s) => s.layouts[id] ?? null);
}

export function useCreateRoomLayout() {
	return useRoomApi((s) => s.createLayout);
}

export function useActiveRoomLayoutId() {
	const id = useRoomState((s) => s.editor.selectedLayoutId || Object.keys(s.layouts)[0] || null);
	const setId = useRoomApi((s) => s.setViewingLayoutId);
	return [id, setId] as const;
}

export function useActiveRoomLayout() {
	return useRoomState((s) => (s.editor.selectedLayoutId ? (s.layouts[s.editor.selectedLayoutId] ?? null) : null));
}

export function useUpdateRoomLayout() {
	return useRoomApi((s) => s.updateLayout);
}

export function useDeleteRoomLayout() {
	return useRoomApi((s) => s.deleteLayout);
}

export function useHasPlanes() {
	return useRoomState((s) => s.planes.length > 0);
}

export function usePlanesUpdatedAt() {
	return useRoomState((s) => s.planesUpdatedAt);
}

export function useUpdatePlanes() {
	return useRoomApi((s) => s.updatePlanes);
}

export function usePlanes(filter?: (p: RoomPlaneData) => boolean) {
	return useRoomState(useShallow((s) => (filter ? s.planes.filter(filter) : s.planes)));
}

export function usePrimaryFloorPlane() {
	const candidates = usePlanes((p) => p.label === 'floor');
	const primaryFloor = candidates.find((p) => Math.sqrt(p.origin.x * p.origin.x + p.origin.y * p.origin.y + p.origin.z * p.origin.z) < 0.01);
	return primaryFloor ?? null;
}

/**
 * Uses a heuristic to determine which ceiling is above the
 * primary floor.
 */
export function usePrimaryCeilingPlane() {
	const floor = usePrimaryFloorPlane();
	const candidates = usePlanes((p) => p.label === 'ceiling');

	if (!floor || candidates.length === 0) {
		return null;
	}

	// suppose we had a multi-level house; the ceiling of a first story room would
	// actually be the closest to the floor of a second story room. so we don't use
	// nearest distance, we use closest X,Z distance and the closest Y that's greater
	// than floor.y
	const primaryCeiling = candidates
		.filter((p) => p.origin.y > floor.origin.y)
		.reduce((closest, candidate) => {
			const closestXZDistance = Math.sqrt(closest.origin.x ** 2 + closest.origin.z ** 2);
			const candidateXZDistance = Math.sqrt(candidate.origin.x ** 2 + candidate.origin.z ** 2);
			if (candidateXZDistance < closestXZDistance) {
				return candidate;
			}
			return closest;
		}, candidates[0]);
	return primaryCeiling ?? null;
}
