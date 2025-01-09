import { Box, ErrorBoundary } from '@alef/sys';
import { Environment, Gltf, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

export interface FurniturePreviewProps {
	furnitureId: string;
	nonce?: string | null;
}

export function FurniturePreview({ furnitureId, nonce = 'none' }: FurniturePreviewProps) {
	const modelSrc = `${import.meta.env.VITE_PUBLIC_API_ORIGIN}/furniture/${furnitureId}/model?nonce=${nonce}`;
	return (
		<ErrorBoundary
			fallback={
				<Box full layout="center center">
					No model
				</Box>
			}
		>
			<Canvas camera={{ position: [0, 1.5, 2] }}>
				<Environment preset="city" />
				<ambientLight intensity={1} />
				<OrbitControls makeDefault target={[0, 1, 0]} />
				<Gltf src={modelSrc} />
			</Canvas>
		</ErrorBoundary>
	);
}
