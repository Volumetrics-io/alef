import { PrefixedId } from '@alef/common';
import { getVoidObject, PointerEventsMap } from '@pmndrs/pointer-events';
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { Object3D, Object3DEventMap } from 'three';
import { create } from 'zustand';

export type EditorStore = {
	selectedFurniturePlacementId: PrefixedId<'fp'> | null;
	select: (id: PrefixedId<'fp'>) => void;
};

export const useEditorStore = create<EditorStore>((set) => {
	return {
		selectedFurniturePlacementId: null,
		select: (id: PrefixedId<'fp'>) => set({ selectedFurniturePlacementId: id }),
	};
});

export function useEditorSelectionReset() {
	const scene = useThree((s) => s.scene);
	useEffect(() => {
		const voidObject = getVoidObject(scene as any) as Object3D<Object3DEventMap & PointerEventsMap>;
		const fn = () => useEditorStore.setState({ selectedFurniturePlacementId: null });
		voidObject.addEventListener('click', fn);
		return () => voidObject.removeEventListener('click', fn);
	}, [scene]);
}
