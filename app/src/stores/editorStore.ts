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

	/** Actual recorded intersections */
	liveIntersections: Record<PrefixedId<'fp'>, string[]>;
	/**
	 * In practice, we always want to snap to something. So if
	 * a movement threatens to empty the intersections list, this
	 * modified list will keep the last seen intersection.
	 */
	stickyIntersections: Record<PrefixedId<'fp'>, string[]>;
	onIntersectionEnter: (id: PrefixedId<'fp'>, planeId: string) => void;
	onIntersectionExit: (id: PrefixedId<'fp'>, planeId: string) => void;
};

export const useEditorStore = create<EditorStore>((set) => {
	return {
		selectedFurniturePlacementId: null,
		select: (id: PrefixedId<'fp'>) => set({ selectedFurniturePlacementId: id }),
		liveIntersections: {},
		stickyIntersections: {},
		onIntersectionEnter: (id, plane) =>
			set((state) => {
				const existing = state.liveIntersections[id];
				const set = new Set(existing);
				set.add(plane);

				return { liveIntersections: { ...state.liveIntersections, [id]: Array.from(set) }, stickyIntersections: { ...state.stickyIntersections, [id]: Array.from(set) } };
			}),
		onIntersectionExit: (id, plane) =>
			set((state) => {
				const existing = state.liveIntersections[id];
				if (!existing) return state;
				const set = new Set(existing);
				set.delete(plane);

				// only update stickyIntersections if there are still intersections remaining
				if (set.size !== 0) {
					return {
						liveIntersections: { ...state.liveIntersections, [id]: Array.from(set) },
						stickyIntersections: { ...state.stickyIntersections, [id]: Array.from(set) },
					};
				}
				return { liveIntersections: { ...state.liveIntersections, [id]: Array.from(set) } };
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
	const intersections = useEditorStore((s) => s.stickyIntersections[id]) ?? [];
	// map to plane info
	return usePlanesStore(useShallow((s) => intersections.map((i) => s.getPlaneLabel(i))));
}
