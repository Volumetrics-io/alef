import { getClosestPointOnXRPlane, getXRPlaneCenterAndNormal } from '@/physics/xrPlaneTools';
import { Vector3 } from 'three';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { xrStore } from './xrStore';

export type PlanesStore = {
	lastXRFrame: XRFrame | null;

	getCenterAndNormal: (xrPlane: XRPlane) => { center: Vector3; normal: Vector3 };
	getClosestPoint: (xrPlane: XRPlane, targetPoint: Vector3) => Vector3;
};

export const usePlanesStore = create<PlanesStore>()(
	subscribeWithSelector((set) => {
		// internally subscribe to XR sessions and reference space
		let currentSession: XRSession | null = null;
		let currentReferenceSpace: XRReferenceSpace | null;
		xrStore.subscribe((s) => {
			if (s.session && s.session !== currentSession) {
				currentSession = s.session;
				s.session.requestAnimationFrame((_t, xrFrame) => {
					set({ lastXRFrame: xrFrame });
				});
			}

			if (s.originReferenceSpace && s.originReferenceSpace !== currentReferenceSpace) {
				currentReferenceSpace = s.originReferenceSpace;
			}
		});

		return {
			lastXRFrame: null,
			getCenterAndNormal(xrPlane) {
				// requirements for computing plane center and normal
				if (!this.lastXRFrame || !currentSession || !currentReferenceSpace) {
					return { center: new Vector3(0, 0, 0), normal: new Vector3(0, 1, 0) };
				}

				return getXRPlaneCenterAndNormal(this.lastXRFrame, currentReferenceSpace, xrPlane);
			},
			getClosestPoint(xrPlane: XRPlane, targetPoint: Vector3) {
				if (!this.lastXRFrame || !currentSession || !currentReferenceSpace) {
					return targetPoint;
				}
				return getClosestPointOnXRPlane(this.lastXRFrame, currentReferenceSpace, xrPlane, targetPoint);
			},
		};
	})
);
