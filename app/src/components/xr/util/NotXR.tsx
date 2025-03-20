import { useXR } from '@react-three/xr';
import { ReactNode } from 'react';

export interface NotXRProps {
	children?: ReactNode;
}

export function NotXR({ children }: NotXRProps) {
	const isXR = useXR((s) => !!s.session);
	if (isXR) {
		return null;
	}
	return <>{children}</>;
}
