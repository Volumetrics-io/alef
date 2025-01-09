import { ErrorBoundary } from '@alef/sys';
import { Environment, Gltf, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

export interface FurniturePreviewProps {
	furnitureId: string;
}

export function FurniturePreview({ furnitureId }: FurniturePreviewProps) {
	const modelSrc = `${import.meta.env.VITE_PUBLIC_API_ORIGIN}/furniture/${furnitureId}/model`;
	return (
		<ErrorBoundary>
			<Canvas camera={{ position: [0, 0, 5] }}>
				<Environment preset="city" />
				<ambientLight intensity={1} />
				<OrbitControls makeDefault />
				<Gltf src={modelSrc} />
			</Canvas>
		</ErrorBoundary>
	);
}
