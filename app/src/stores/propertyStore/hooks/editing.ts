import { EditorMode, isPrefixedId, PrefixedId } from '@alef/common';
import { getVoidObject, PointerEventsMap } from '@pmndrs/pointer-events';
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { Object3D, Object3DEventMap } from 'three';
import { usePropertyStore } from '../propertyStore.js';
import { useRoomApi, useRoomState, useRoomStateSubscribe } from './rooms.js';

export function useHasSelectedRoom() {
	return usePropertyStore((s) => s.meta.selectedRoomId !== null);
}

export function useSelectRoom() {
	return usePropertyStore((s) => s.api.selectRoom);
}

export function useEditorMode() {
	const mode = useRoomState((s) => s.editor.mode);
	const setMode = useRoomApi((api) => api.setEditorMode);
	return [mode, setMode] as const;
}

export function useIsEditorMode(mode: EditorMode) {
	return useRoomState((s) => s.editor.mode === mode);
}

export function useSelect() {
	return useRoomApi((s) => s.select);
}

export function useIsSelected(id: PrefixedId<'fp'> | PrefixedId<'lp'>) {
	return useRoomState((s) => s.editor.selectedObjectId === id);
}

export function useSelectedObjectId() {
	return useRoomState((s) => s.editor.selectedObjectId);
}

export function useSelectedFurniturePlacementId() {
	return useRoomState((s) => (s.editor.selectedObjectId && isPrefixedId(s.editor.selectedObjectId, 'fp') ? s.editor.selectedObjectId : null));
}

export function useSelectedLightPlacementId() {
	return useRoomState((s) => (s.editor.selectedObjectId && isPrefixedId(s.editor.selectedObjectId, 'lp') ? s.editor.selectedObjectId : null));
}

export function useResetSelectionOnClickAway() {
	const select = useSelect();
	const scene = useThree((s) => s.scene);
	useEffect(() => {
		const voidObject = getVoidObject(scene as any) as Object3D<Object3DEventMap & PointerEventsMap>;
		const fn = () => select(null);
		voidObject.addEventListener('click', fn);
		return () => voidObject.removeEventListener('click', fn);
	}, [scene, select]);
}

export function useSetPlacingFurniture() {
	return useRoomApi((s) => s.setPlacingFurniture);
}

export function usePlacingFurnitureId() {
	return useRoomState((s) => s.editor.placingFurnitureId);
}

export function useOnSelectionChanged(cb: (selectedId: PrefixedId<'fp'> | PrefixedId<'lp'> | null) => void, options?: { fireImmediately?: boolean }) {
	// subscribe to changes in the selected object id
	useRoomStateSubscribe((s) => s.editor.selectedObjectId, cb, options);
}
