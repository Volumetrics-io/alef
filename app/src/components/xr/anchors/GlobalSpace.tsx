import { usePrimaryXRFloorPlane } from '@/hooks/usePrimaryXRFloorPlane';
import { usePrimaryFloorPlane } from '@/stores/roomStore';
import { XRSpace } from '@react-three/xr';
import { ReactNode } from 'react';

export interface GlobalSpaceProps {
	children?: ReactNode;
}

/**
 * Unified anchor space for both XR and 2D experiences. Children will
 * be relative to Alef's conception of "world space" regardless of whether
 * you're in headset or not.
 */
export function GlobalSpace({ children }: GlobalSpaceProps) {
	// detect primary floor, its origin length should be very small
	const primaryFloor = usePrimaryFloorPlane();

	// now let's find the matching XR floor plane
	const primaryXRPlane = usePrimaryXRFloorPlane();

	// if this exists we're in XR.
	if (primaryXRPlane) {
		return (
			<XRSpace space={primaryXRPlane.planeSpace}>
				<group rotation={[Math.PI, 0, 0]}>{children}</group>
			</XRSpace>
		);
	}

	// otherwise we're not in XR. we use our copied plane state to orient the world.
	if (!primaryFloor) {
		// 0,0,0 is all we got
		return <group>{children}</group>;
	}

	const { origin, orientation } = primaryFloor;
	return (
		<group position={[origin.x, origin.y, origin.z]} quaternion={[orientation.x, orientation.y, orientation.z, orientation.w]}>
			{children}
		</group>
	);
}
