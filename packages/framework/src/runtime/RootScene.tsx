import { Canvas } from '@react-three/fiber';
import { ReactNode, Suspense } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { OnscreenControls } from './controls/OnscreenControls';

export interface RootSceneProps {
	children: ReactNode;
}

export function RootScene({ children }: RootSceneProps) {
	return (
		<ErrorBoundary fallback={<div>An Alef bug caused this app to crash</div>}>
			<ErrorBoundary fallback={<div>The app crashed</div>}>
				<Canvas style={{ width: '100%', height: '100%' }} shadows camera={{ position: [0, 0, 5], fov: 75 }}>
					<Suspense fallback={null}>{children}</Suspense>
				</Canvas>
			</ErrorBoundary>
			<OnscreenControls />
		</ErrorBoundary>
	);
}
