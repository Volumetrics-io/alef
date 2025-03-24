import { PrefixedId, RoomPlaneData } from '@alef/common';
import { useShallow } from 'zustand/react/shallow';
import { useRoomStore } from '../roomStore';

export function useRoomLayoutIds() {
	return useRoomStore(useShallow((s) => Object.keys(s.layouts) as PrefixedId<'rl'>[]));
}

export function useRoomLayout(id: PrefixedId<'rl'>) {
	return useRoomStore((s) => s.layouts[id] ?? null);
}

export function useCreateRoomLayout() {
	return useRoomStore((s) => s.createLayout);
}

export function useActiveRoomLayoutId() {
	return useRoomStore(useShallow((s) => [s.viewingLayoutId || (Object.keys(s.layouts)[0] as PrefixedId<'rl'>), s.setViewingLayoutId] as const));
}

export function useActiveRoomLayout() {
	return useRoomStore((s) => (s.viewingLayoutId ? (s.layouts[s.viewingLayoutId] ?? null) : null));
}

export function useUpdateRoomLayout() {
	return useRoomStore((s) => s.updateLayout);
}

export function useDeleteRoomLayout() {
	return useRoomStore((s) => s.deleteLayout);
}

export function useHasPlanes() {
	return useRoomStore((s) => s.planes.length > 0);
}

export function usePlanesUpdatedAt() {
	return useRoomStore((s) => s.planesUpdatedAt);
}

export function useUpdatePlanes() {
	return useRoomStore((s) => s.updatePlanes);
}

export function usePlanes(filter?: (p: RoomPlaneData) => boolean) {
	return useRoomStore(useShallow((s) => (filter ? s.planes.filter(filter) : s.planes)));
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
