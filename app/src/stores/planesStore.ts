import { getClosestPointOnPlane } from '@/physics/xrPlaneTools';
import { useFrame } from '@react-three/fiber';
import * as O from 'optics-ts';
import { useRef } from 'react';
import { Object3D, Quaternion, Vector3 } from 'three';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { xrStore } from './xrStore';

export type PlaneInfo = {
	center: Vector3;
	normal: Vector3;
	label: string;
};

// since XRPlanes don't have native IDs, we generate and store them
// here so they can be used as keys in the planes store
const planeIdMap = new WeakMap<XRPlane, string>();
export function getPlaneId(plane: XRPlane) {
	if (!planeIdMap.has(plane)) {
		planeIdMap.set(plane, crypto.randomUUID());
	}
	return planeIdMap.get(plane)!;
}

export type PlanesStore = {
	planes: Record<string, PlaneInfo>;
	getClosestPoint: (planeId: string, targetPoint: Vector3) => Vector3;
	getPlaneInfo: (planeId: string) => PlaneInfo | undefined;
	getPlaneLabel: (planeId: string) => string;
	updatePlane: (id: string, info: PlaneInfo) => void;
};

export const usePlanesStore = create<PlanesStore>()(
	subscribeWithSelector((set, get) => {
		// internally subscribe to XR sessions and reference space.
		// NOTE: XRFrame cannot be used outside of a session RAF loop. we subscribe
		// to that loop here and precompute necessary plane data within that function.
		// this data is then stored in the store for use elsewhere. while the data may
		// not be up-to-the-frame accurate, it's close enough (maybe one frame behind)
		// and having it available anywhere and everywhere is key.
		let currentSession: XRSession | null = null;
		let currentReferenceSpace: XRReferenceSpace | null;

		xrStore.subscribe((s) => {
			if (s.session && s.session !== currentSession) {
				currentSession = s.session;
			}

			if (s.originReferenceSpace && s.originReferenceSpace !== currentReferenceSpace) {
				currentReferenceSpace = s.originReferenceSpace;
			}
		});

		return {
			planes: {},
			getClosestPoint(planeId: string, targetPoint: Vector3) {
				const info = get().planes[planeId];
				if (!info) {
					return targetPoint;
				}
				return getClosestPointOnPlane(info.normal, info.center, targetPoint);
			},
			getPlaneInfo(planeId: string) {
				return get().planes[planeId];
			},
			getPlaneLabel(planeId: string) {
				return get().planes[planeId]?.label ?? 'unknown';
			},
			updatePlane(planeId: string, info: PlaneInfo) {
				set(
					O.modify(O.optic<PlanesStore>().prop('planes').prop(planeId))((s) => {
						if (!s) {
							return info;
						}
						Object.assign(s, info);
						return s;
					})
				);
			},
		};
	})
);

/**
 * Pass the returned ref to the XRSpace for the plane
 */
export function useRegisterXRPlane(xrPlane: XRPlane) {
	const id = getPlaneId(xrPlane);
	return useRegisterManualPlane(id, xrPlane.semanticLabel ?? 'unknown');
}

export function useRegisterManualPlane(id: string, label: string) {
	const ref = useRef<Object3D>(null);
	const update = usePlanesStore((s) => s.updatePlane);
	const normal = new Vector3();
	const center = new Vector3();
	const quat = new Quaternion();
	useFrame(() => {
		if (!ref.current) return;

		ref.current.getWorldQuaternion(quat);
		normal.set(0, -1, 0).applyQuaternion(quat);
		ref.current.getWorldPosition(center);
		update(id, { label, center, normal });
	});

	return ref;
}
