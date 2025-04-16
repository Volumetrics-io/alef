import { Canvas } from '@react-three/fiber';
import { ReactNode, Suspense } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

export interface RootSceneProps {
	children: ReactNode;
}

export function RootScene({ children }: RootSceneProps) {
	return (
		<ErrorBoundary fallback={<div>The app crashed</div>}>
			<Canvas shadows camera={{ position: [0, 0, 5], fov: 50 }}>
				<Suspense fallback={null}>{children}</Suspense>
			</Canvas>
		</ErrorBoundary>
	);
}
