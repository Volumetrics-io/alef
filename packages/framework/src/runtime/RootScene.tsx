import { Canvas } from '@react-three/fiber';
import { Sky, OrbitControls } from '@react-three/drei';
import { ReactNode, Suspense } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

export interface RootSceneProps {
	children: ReactNode;
}

export function RootScene({ children }: RootSceneProps) {
	return (
		<ErrorBoundary fallback={<div>The app crashed</div>}>
			<Canvas style={{ width: '100%', height: '100%' }} shadows camera={{ position: [0, 0, 5], fov: 75 }}>
				<Sky />
				<OrbitControls />
				<ambientLight intensity={1} />
				<Suspense fallback={null}>{children}</Suspense>
			</Canvas>
		</ErrorBoundary>
	);
}
