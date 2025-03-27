import { isPrefixedId, PrefixedId } from '@alef/common';
import { getVoidObject, PointerEventsMap } from '@pmndrs/pointer-events';
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { Object3D, Object3DEventMap } from 'three';
import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

export type StageMode = 'lighting' | 'furniture' | 'layout' | 'settings' | null;

export type PanelState = 'open' | 'closed' | 'hidden';

export type EditorStore = {
	splashScreen: boolean;

	panelState: PanelState;
	setPanelState: (panelState: PanelState) => void;

	mode: StageMode;
	setMode: (mode: StageMode) => void;

	selectedId: PrefixedId<'fp'> | PrefixedId<'lp'> | null;
	select: (id: PrefixedId<'fp'> | PrefixedId<'lp'> | null) => void;

	selectedModelId: PrefixedId<'f'> | null;
	setSelectedModelId: (id: PrefixedId<'f'> | null) => void;

	// only relevant for 2d mode right now
	detailsOpen: boolean;
	setDetailsOpen: (open: boolean) => void;

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

export const useEditorStore = create<EditorStore>((set, get) => {
	// enable the splash screen by default when rendering in the PWA
	const splashScreen = new URLSearchParams(window.location.search).get('directLaunch') === 'true';
	if (splashScreen) {
		// close splash screen after 5 seconds
		setTimeout(() => set({ splashScreen: false }), 5000);
	}

	return {
		splashScreen,
		panelState: 'closed',
		setPanelState: (panelState: PanelState) => set({ panelState }),
		mode: null,
		setMode: (mode: StageMode) => set({ mode }),
		selectedId: null,
		select: (id) => {
			set({ selectedId: id, detailsOpen: true });
		},
		selectedModelId: null,
		setSelectedModelId: (id) => set({ selectedModelId: id }),
		liveIntersections: {},
		stickyIntersections: {},
		detailsOpen: false,
		setDetailsOpen: (open) => set({ detailsOpen: open }),
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
	return useEditorStore(useShallow((s) => s.select));
}

export function useIsSelected(id: PrefixedId<'fp'> | PrefixedId<'lp'>) {
	return useEditorStore(useShallow((s) => s.selectedId === id && s.mode === 'furniture'));
}

export function useSetSelectedModelId() {
	return useEditorStore((s) => s.setSelectedModelId);
}

export function useSelectedModelId() {
	return useEditorStore((s) => s.selectedModelId);
}

export function useIsSelectedModelId(id: PrefixedId<'f'>) {
	return useEditorStore((s) => s.selectedModelId === id);
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

export function useSelectedFurniturePlacementId() {
	return useEditorStore(({ selectedId }) => (selectedId && isPrefixedId(selectedId, 'fp') && selectedId) || null);
}

export function useSelectedLightPlacementId() {
	return useEditorStore(({ selectedId }) => (selectedId && isPrefixedId(selectedId, 'lp') && selectedId) || null);
}

export function useLightIsSelected(lightPlacementId: PrefixedId<'lp'>) {
	return useEditorStore(({ selectedId }) => selectedId === lightPlacementId);
}

export function usePanelState() {
	return useEditorStore(useShallow((s) => [s.panelState, s.setPanelState] as const));
}

export function useSetPanelState() {
	return useEditorStore(useShallow((s) => s.setPanelState));
}

export function useEditorStageMode() {
	return useEditorStore(useShallow((s) => [s.mode, s.setMode] as const));
}

export function useIsEditorStageMode(value: StageMode) {
	return useEditorStore(useShallow((s) => s.mode === value));
}

export function useDetailsOpen() {
	const value = useEditorStore((s) => s.detailsOpen);
	const set = useEditorStore((s) => s.setDetailsOpen);
	return [value, set] as const;
}
