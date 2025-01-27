import { getClosestPointOnPlane } from '@/physics/xrPlaneTools';
import { useFrame } from '@react-three/fiber';
import * as O from 'optics-ts';
import { useRef } from 'react';
import { Object3D, Quaternion, Vector3 } from 'three';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { xrStore } from './xrStore';

type PlaneInfo = {
	center: Vector3;
	normal: Vector3;
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
	getClosestPoint: (xrPlane: XRPlane, targetPoint: Vector3) => Vector3;
	getPlaneInfo: (xrPlane: XRPlane) => PlaneInfo | undefined;
	updatePlane: (xrPlane: XRPlane, center: Vector3, normal: Vector3) => void;
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
			getClosestPoint(xrPlane: XRPlane, targetPoint: Vector3) {
				const planeId = getPlaneId(xrPlane);
				const info = get().planes[planeId];
				if (!info) {
					return targetPoint;
				}
				return getClosestPointOnPlane(info.normal, info.center, targetPoint);
			},
			getPlaneInfo(xrPlane: XRPlane) {
				const planeId = getPlaneId(xrPlane);
				return get().planes[planeId];
			},
			updatePlane(xrPlane: XRPlane, center: Vector3, normal: Vector3) {
				const planeId = getPlaneId(xrPlane);
				set(O.modify(O.optic<PlanesStore>().prop('planes').prop(planeId))(() => ({ center, normal })));
			},
		};
	})
);

/**
 * Pass the returned ref to the XRSpace for the plane
 */
export function useRegisterPlane(xrPlane: XRPlane) {
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
		update(xrPlane, center, normal);
	});

	return ref;
}
