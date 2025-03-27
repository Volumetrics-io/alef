import { EditorMode, isPrefixedId, PrefixedId } from '@alef/common';
import { getVoidObject, PointerEventsMap } from '@pmndrs/pointer-events';
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { Object3D, Object3DEventMap } from 'three';
import { useShallow } from 'zustand/react/shallow';
import { useRoomStore } from '../roomStore';

export function useEditorMode() {
	return useRoomStore(useShallow((s) => [s.editor.mode, s.setEditorMode] as const));
}

export function useIsEditorMode(mode: EditorMode) {
	return useRoomStore((s) => s.editor.mode === mode);
}

export function useSelect() {
	return useRoomStore((s) => s.select);
}

export function useIsSelected(id: PrefixedId<'fp'> | PrefixedId<'lp'>) {
	return useRoomStore((s) => s.editor.selectedObjectId === id);
}

export function useSelectedObjectId() {
	return useRoomStore((s) => s.editor.selectedObjectId);
}

export function useSelectedFurniturePlacementId() {
	return useRoomStore((s) => (s.editor.selectedObjectId && isPrefixedId(s.editor.selectedObjectId, 'fp') ? s.editor.selectedObjectId : null));
}

export function useSelectedLightPlacementId() {
	return useRoomStore((s) => (s.editor.selectedObjectId && isPrefixedId(s.editor.selectedObjectId, 'lp') ? s.editor.selectedObjectId : null));
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
	return useRoomStore((s) => s.setPlacingFurniture);
}

export function usePlacingFurnitureId() {
	return useRoomStore((s) => s.editor.placingFurnitureId);
}
