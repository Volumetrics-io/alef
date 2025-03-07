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
	return useRoomStore(useShallow((s) => [s.viewingLayoutId, s.setViewingLayoutId] as const));
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
