import { useAllFurniture, useFurnitureDetails } from '@/services/publicApi/furnitureHooks';
import { isPrefixedId, PrefixedId, RoomFurniturePlacement } from '@alef/common';
import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useSelect } from './editing';
import { useRoomApi, useRoomState, useRoomStateSubscribe } from './rooms.js';

export function useFurniturePlacementIds() {
	return useRoomState(useShallow((s) => Object.keys(s.editor.selectedLayoutId ? (s.layouts[s.editor.selectedLayoutId]?.furniture ?? {}) : {}) as PrefixedId<'fp'>[]));
}

export function useFurniturePlacement(id: PrefixedId<'fp'>) {
	return useRoomState((s) => (s.editor.selectedLayoutId ? (s.layouts[s.editor.selectedLayoutId]?.furniture[id] ?? null) : null));
}

export function useDeleteFurniturePlacement(id: PrefixedId<'fp'> | undefined) {
	const deleteFn = useRoomApi((s) => s.deleteFurniture);
	return useCallback(() => {
		if (!id) return;
		deleteFn(id);
	}, [deleteFn, id]);
}

export function useFurniturePlacementFurnitureId(id: PrefixedId<'fp'>) {
	return useRoomState((s) => (s.editor.selectedLayoutId ? (s.layouts[s.editor.selectedLayoutId]?.furniture[id]?.furnitureId ?? null) : null));
}

export function useSetFurniturePlacementFurnitureId() {
	return useRoomApi((s) => s.updateFurnitureId);
}

export function useAddFurniture() {
	const add = useRoomApi((s) => s.addFurniture);
	const select = useSelect();
	return useCallback(
		async (placement: Omit<RoomFurniturePlacement, 'id'>) => {
			const id = await add(placement);
			select(id);
		},
		[add, select]
	);
}

export function useSubscribeToPlacementPosition(id: PrefixedId<'fp'> | PrefixedId<'lp'>, callback: (position: { x: number; y: number; z: number }) => void) {
	useRoomStateSubscribe(
		(s) => (s.editor.selectedLayoutId ? (isPrefixedId(id, 'fp') ? (s.layouts[s.editor.selectedLayoutId]?.furniture[id] ?? null) : (s.lights[id] ?? null)) : null),
		(placement) => {
			if (placement) {
				callback(placement.position);
			}
		},
		{
			fireImmediately: true,
		}
	);
}

export function useUpdateFurniturePlacementTransform(id: PrefixedId<'fp'>) {
	const set = useRoomApi((s) => s.moveFurniture);
	return useCallback((transform: { position?: { x: number; y: number; z: number }; rotation?: { x: number; y: number; z: number; w: number } }) => set(id, transform), [id, set]);
}

export function useFurnitureQuickSwap(furniturePlacement: RoomFurniturePlacement) {
	const { furnitureId: currentFurnitureId, id } = furniturePlacement;
	const setFurnitureId = useSetFurniturePlacementFurnitureId();
	const { data: currentFurniture } = useFurnitureDetails(currentFurnitureId);
	const { data: furniture } = useAllFurniture({
		attributeFilter: currentFurniture?.attributes,
	});

	const furnitureIds = furniture.pages
		.flatMap((page) => page.items)
		.map((f) => f.id)
		.sort();

	const swapPrevious = () => {
		const index = furnitureIds.findIndex((f) => f === currentFurnitureId);
		if (index > 0) {
			setFurnitureId(id, furnitureIds[index - 1]);
		}
	};

	const swapNext = () => {
		const index = furnitureIds.findIndex((f) => f === currentFurnitureId);
		if (index < furnitureIds.length - 1) {
			setFurnitureId(id, furnitureIds[index + 1]);
		}
	};

	return {
		swapPrevious,
		swapNext,
	};
}
