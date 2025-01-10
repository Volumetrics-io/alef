import { useXRPlanes, XRSpace } from '@react-three/xr';
import React, { forwardRef, useImperativeHandle, createContext } from 'react';
import { Matrix4, Vector3 } from 'three';

// Define the ref type
export interface XRPlaneRef {
	plane: XRPlane | null;
}

export type PlaneLabel = 'desk' | 'couch' | 'floor' | 'ceiling' | 'wall' | 'door' | 'window' | 'other' | 'screen' ;

export const PlaneAnchorContext = createContext<XRPlane | null>(null);

export const PlaneAnchor = forwardRef<XRPlaneRef, { label: PlaneLabel; near?: PlaneLabel[]; children: React.ReactNode }>(({ label, near, children }, ref) => {
	const planes = useXRPlanes(label as string);
	const plane = planes.length > 0 ? planes[0] : null;
	// Expose the plane through the ref
	useImperativeHandle(ref, () => ({
		plane: plane || null,
	}));

	if (plane) {
		return (
			<PlaneAnchorContext.Provider value={plane}>
				<XRSpace space={plane.planeSpace}>
					<group rotation={[Math.PI, 0, 0]}>
						{children}
					</group>
				</XRSpace>
			</PlaneAnchorContext.Provider>
		);
	} else {
		return <group>{children}</group>;
	}
});

// Add display name for dev tools
PlaneAnchor.displayName = 'PlaneAnchor';
