import { isPrefixedId, PrefixedId, SimpleVector3 } from '@alef/common';
import { getVoidObject, PointerEventsMap } from '@pmndrs/pointer-events';
import { useFrame, useThree } from '@react-three/fiber';
import { useGetXRSpaceMatrix, useXR, useXRPlanes, useXRSpace } from '@react-three/xr';
import { useCallback, useEffect, useRef } from 'react';
import { Matrix4, Object3D, Object3DEventMap, Vector3 } from 'three';
import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { usePlanes } from './roomStore';

export type StageMode = 'lighting' | 'furniture' | 'layout' | 'settings' | null;

export type PanelState = 'open' | 'closed' | 'hidden';

export type EditorStore = {
	panelState: PanelState;
	setPanelState: (panelState: PanelState) => void;

	mode: StageMode;
	setMode: (mode: StageMode) => void;

	selectedId: PrefixedId<'fp'> | PrefixedId<'lp'> | null;
	select: (id: PrefixedId<'fp'> | PrefixedId<'lp'> | null) => void;

	// only relevant for 2d mode right now
	detailsOpen: boolean;
	setDetailsOpen: (open: boolean) => void;

	closestFloorCenter: SimpleVector3;
	updateClosestFloorCenter: (center: SimpleVector3) => void;

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
	return {
		panelState: 'closed',
		setPanelState: (panelState: PanelState) => set({ panelState }),
		mode: null,
		setMode: (mode: StageMode) => set({ mode }),
		selectedId: null,
		select: (id) => {
			set({ selectedId: id, detailsOpen: true });
		},
		liveIntersections: {},
		stickyIntersections: {},
		closestFloorCenter: { x: 0, y: 0, z: 0 },
		detailsOpen: false,
		setDetailsOpen: (open) => set({ detailsOpen: open }),
		updateClosestFloorCenter: (center) => {
			// this may be called in a tight loop, so avoid assignment/allocation
			const existing = get().closestFloorCenter;
			if (existing.x === center.x && existing.y === center.y && existing.z === center.z) return;
			existing.x = center.x;
			existing.y = center.y;
			existing.z = center.z;
			// not actually sure this does anything, but we don't really need the reactivity portion for this.
			set({ closestFloorCenter: existing });
		},
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

export function useUpdateClosestFloorCenter() {
	const isInSession = useXR((s) => !!s.session);
	const viewerSpace = useXRSpace('head');
	const originSpace = useXR((s) => s.originReferenceSpace);
	const getViewerMatrix = useGetXRSpaceMatrix(viewerSpace);
	const xrFloors = useXRPlanes('floor');
	const savedFloors = usePlanes((p) => p.label === 'floor');
	const updateClosestFloorCenter = useEditorStore((s) => s.updateClosestFloorCenter);

	// temp vars
	const tempVars = useRef({
		viewerPosition: new Vector3(),
		viewerMatrix: new Matrix4(),
		floorPosition: new Vector3(),
	});
	useFrame((state, __, xrFrame: XRFrame) => {
		// if in XR, we use the head position to determine viewer position
		// otherwise, we use the camera position
		const { viewerPosition, viewerMatrix, floorPosition } = tempVars.current;
		let gotViewer = false;
		if (isInSession && getViewerMatrix) {
			if (getViewerMatrix(viewerMatrix, xrFrame)) {
				viewerPosition.setFromMatrixPosition(viewerMatrix);
				gotViewer = true;
			}
		}
		if (!gotViewer) {
			// other attempts failed, use camera
			viewerPosition.copy(state.camera.position);
		}

		// in XR, we can use the XR detected floor planes to find the closest floor
		if (isInSession && xrFloors.length && originSpace) {
			// find the closest floor plane
			let closestDistance = Infinity;
			let pose: XRPose | undefined;
			for (const floor of xrFloors) {
				pose = xrFrame.getPose(floor.planeSpace, originSpace);
				if (!pose) {
					continue;
				}
				floorPosition.copy(pose.transform.position);
				const distance = viewerPosition.distanceTo(floorPosition);
				if (distance < closestDistance) {
					closestDistance = distance;
					updateClosestFloorCenter(floorPosition);
				}
			}
		} else if (savedFloors.length) {
			// outside XR, or if planes aren't detected, we can fall back to saved planes
			// from the room data.
			let closestDistance = Infinity;
			for (const floor of savedFloors) {
				floorPosition.set(floor.origin.x, floor.origin.y, floor.origin.z);
				const distance = viewerPosition.distanceTo(floorPosition);
				if (distance < closestDistance) {
					closestDistance = distance;
					updateClosestFloorCenter(floorPosition);
				}
			}
		} else {
			// we really have nothing to work with -- just use 0
			floorPosition.set(0, 0, 0);
			updateClosestFloorCenter(floorPosition);
		}
	});
}

/**
 * This returns a getter function since the center position
 * is not updated reactively. You have to call this getter
 * when you want to read the position.
 */
export function useClosestFloorCenterGetter() {
	return useCallback(() => {
		return useEditorStore.getState().closestFloorCenter;
	}, []);
}

export function useDetailsOpen() {
	const value = useEditorStore((s) => s.detailsOpen);
	const set = useEditorStore((s) => s.setDetailsOpen);
	return [value, set] as const;
}
