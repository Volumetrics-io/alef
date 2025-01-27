import { PrefixedId } from '@alef/common';
import { getVoidObject, PointerEventsMap } from '@pmndrs/pointer-events';
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { Object3D, Object3DEventMap } from 'three';
import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { usePlanesStore } from './planesStore';

export type EditorStore = {
	selectedFurniturePlacementId: PrefixedId<'fp'> | null;
	select: (id: PrefixedId<'fp'>) => void;

	intersections: Record<PrefixedId<'fp'>, string[]>;
	onIntersectionEnter: (id: PrefixedId<'fp'>, planeId: string) => void;
	onIntersectionExit: (id: PrefixedId<'fp'>, planeId: string) => void;
};

export const useEditorStore = create<EditorStore>((set) => {
	return {
		selectedFurniturePlacementId: null,
		select: (id: PrefixedId<'fp'>) => set({ selectedFurniturePlacementId: id }),
		intersections: {},
		onIntersectionEnter: (id, plane) =>
			set((state) => {
				const existing = state.intersections[id];
				const set = new Set(existing);
				set.add(plane);

				return { intersections: { ...state.intersections, [id]: Array.from(set) } };
			}),
		onIntersectionExit: (id, plane) =>
			set((state) => {
				const existing = state.intersections[id];
				if (!existing) return state;
				const set = new Set(existing);
				set.delete(plane);
				return { intersections: { ...state.intersections, [id]: Array.from(set) } };
			}),
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

export function useIntersectingPlaneLabels(id: PrefixedId<'fp'>) {
	const intersections = useEditorStore((s) => s.intersections[id]) ?? [];
	// map to plane info
	return usePlanesStore(useShallow((s) => intersections.map((i) => s.getPlaneLabel(i))));
}
