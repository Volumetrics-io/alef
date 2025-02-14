import { isPrefixedId, PrefixedId } from '@alef/common';
import { getVoidObject, PointerEventsMap } from '@pmndrs/pointer-events';
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { Object3D, Object3DEventMap } from 'three';
import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { usePlanesStore } from './planesStore';

export type StageMode = 'lighting' | 'furniture' | 'layout' | null;

export type EditorStore = {
	mode: StageMode;
	setMode: (mode: StageMode) => void;

	selectedId: PrefixedId<'fp'> | PrefixedId<'lp'> | null;
	select: (id: PrefixedId<'fp'> | PrefixedId<'lp'> | null) => void;

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
		mode: null,
		setMode: (mode: StageMode) => set({ mode }),
		selectedId: null,
		select: (id) => set({ selectedId: id }),
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

export function useSelect() {
	return useEditorStore((s) => s.select);
}

export function useEditorSelectionReset() {
	const scene = useThree((s) => s.scene);
	useEffect(() => {
		const voidObject = getVoidObject(scene as any) as Object3D<Object3DEventMap & PointerEventsMap>;
		const fn = () => useEditorStore.setState({ selectedId: null });
		voidObject.addEventListener('click', fn);
		return () => voidObject.removeEventListener('click', fn);
	}, [scene]);
}

export function useIntersectingPlaneLabels(id: PrefixedId<'fp'>) {
	const intersections = useEditorStore((s) => s.stickyIntersections[id]) ?? [];
	// map to plane info
	return usePlanesStore(useShallow((s) => intersections.map((i) => s.getPlaneLabel(i))));
}

export function useSelectedFurniturePlacementId() {
	return useEditorStore(({ selectedId }) => (selectedId && isPrefixedId(selectedId, 'fp') && selectedId) || null);
}

export function useSelectedLightPlacementId() {
	return useEditorStore(({ selectedId }) => (selectedId && isPrefixedId(selectedId, 'lp') && selectedId) || null);
}

export function useEditorStageMode() {
	return useEditorStore(useShallow((s) => [s.mode, s.setMode] as const));
}

export function useIsEditorStageMode(value: StageMode) {
	return useEditorStore((s) => s.mode === value);
}
