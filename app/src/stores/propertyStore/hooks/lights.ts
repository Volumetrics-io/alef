import { PrefixedId, RoomLightPlacement } from '@alef/common';
import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useSelect } from './editing';
import { useRoomApi, useRoomState } from './rooms.js';

export function useLightPlacementIds() {
	return useRoomState(useShallow((s) => Object.keys(s.lights ?? {}) as PrefixedId<'lp'>[]));
}

export function useLightPlacement(id: PrefixedId<'lp'>) {
	return useRoomState((s) => s.lights[id] ?? null);
}

export function useLights() {
	return useRoomState((s) => s.lights);
}

export function useDeleteLightPlacement(id: PrefixedId<'lp'>) {
	const deleteFn = useRoomApi((s) => s.deleteLight);
	return useCallback(() => {
		deleteFn(id);
	}, [deleteFn, id]);
}

export function useAddLight() {
	const add = useRoomApi((s) => s.addLight);
	const select = useSelect();
	return useCallback(
		async (light: Omit<RoomLightPlacement, 'id'>) => {
			const id = await add(light);
			select(id);
		},
		[add, select]
	);
}

export function useCanAddLights(maxLights = 6, lights = useLights()) {
	return useCallback(() => {
		return Object.keys(lights).length < maxLights;
	}, [lights, maxLights]);
}

export function useMoveLight(id: PrefixedId<'lp'>) {
	const moveFn = useRoomApi((s) => s.moveLight);
	return useCallback(
		(transform: { position?: { x: number; y: number; z: number } }) => {
			moveFn(id, transform);
		},
		[id, moveFn]
	);
}

export function useGlobalLighting() {
	const value = useRoomState((s) => s.globalLighting);
	const update = useRoomApi((s) => s.updateGlobalLighting);
	return [value, update] as const;
}
