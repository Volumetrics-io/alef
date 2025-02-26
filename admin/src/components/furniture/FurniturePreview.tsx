import { adminApiClient } from '@/services/adminApi';
import { setSnapshotNonce, useSnapshotNonce } from '@/state/snapshotNonces';
import { FurnitureModelQuality, PrefixedId } from '@alef/common';
import { Box, Control, ErrorBoundary, Icon, Select } from '@alef/sys';
import { Environment, OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FurnitureSnapshot } from './FurnitureSnapshot';
import { removeNeedsScreenshot } from '@/stores/furnitureStore';
import { useAABB } from '@/hooks/useAABB';
import { Vector3 } from 'three';


export interface FurniturePreviewProps {
	furnitureId: PrefixedId<'f'>;
	nonce?: string | null;
}

export function FurniturePreview({ furnitureId, nonce = 'none' }: FurniturePreviewProps) {
	const [quality, setQuality] = useState<FurnitureModelQuality>(FurnitureModelQuality.Original);
	const modelSrc = `${import.meta.env.VITE_PUBLIC_API_ORIGIN}/furniture/${furnitureId}/model?nonce=${nonce}&quality=${quality}`;

	const { ref: canvasRef, triggerScreenshot, onModelLoaded } = useScreenshot(furnitureId);

	return (
		<Box stacked>
			<Select value={quality} onValueChange={(v) => setQuality(v as FurnitureModelQuality)}>
				<Select.Item value={FurnitureModelQuality.Original}>LOD: Original</Select.Item>
				<Select.Item value={FurnitureModelQuality.Medium}>LOD: Medium</Select.Item>
				<Select.Item value={FurnitureModelQuality.Low}>LOD: Low</Select.Item>
				<Select.Item value={FurnitureModelQuality.Collision}>LOD: Collision</Select.Item>
			</Select>
			<ErrorBoundary
				fallback={
					<Box full layout="center center">
						No model
					</Box>
				}
				key={quality}
			>
				<Canvas
					camera={{ position: [1, 1.5, 2] }}
					ref={canvasRef}
					style={{
						aspectRatio: '1/1',
					}}
					gl={{
						preserveDrawingBuffer: true,
					}}
				>
					<Environment preset="city" />
					<ambientLight intensity={1} />
					<OrbitControls makeDefault target={[0, 0.6, 0]} />
					<FurnitureModel modelSrc={modelSrc} onLoaded={onModelLoaded} />
				</Canvas>
			</ErrorBoundary>
			<Control float="bottom-right" onClick={() => triggerScreenshot()}>
				<FurnitureSnapshot furnitureId={furnitureId} />
				<Box float="bottom-right">
					<Icon name="refresh-cw" />
				</Box>
			</Control>
		</Box>
	);
}

function FurnitureModel({ modelSrc, onLoaded }: { modelSrc: string; onLoaded?: () => void }) {
	const { scene } = useGLTF(modelSrc, undefined, undefined, (loader) => {
		loader.setWithCredentials(true);
	});
	const { camera } = useThree();
	const { size, ref: aabbRef } = useAABB();
	const centered = useRef(false);

	useEffect(() => {
		if (scene) {
			aabbRef(scene);
		}
	}, [scene]);

	useEffect(() => {
		if (Math.max(size.x, size.y, size.z) < 0.01) {
			return;
		}
		if (!centered.current) {
			// Cast scene to Object3D to avoid type issues
			// Calculate the camera position based on the bounding box
			const maxDimension = Math.max(size.x, size.y, size.z);
			const distance = maxDimension * 2; // Adjust this multiplier to change how far the camera is
			const cameraPosition = new Vector3(1, 1.5, 2).normalize().multiplyScalar(distance);
			camera.position.copy(cameraPosition);
			centered.current = true;
			// Only call onLoaded after we've centered the camera
		}
		onLoaded?.();

	}, [size]); // Only depend on scene changes

	return <primitive object={scene} />;
}

export function useHasImage(imageSrc: string) {
	const [hasImage, setHasImage] = useState<boolean | undefined>(undefined);
	useEffect(() => {
		const img = new Image();
		img.onload = () => setHasImage(true);
		img.onerror = () => setHasImage(false);
		img.src = imageSrc;
	}, [imageSrc]);

	return hasImage;
}

function useScreenshot(furnitureId: PrefixedId<'f'>) {
	const ref = useRef<HTMLCanvasElement>(null);
	const [isModelLoaded, setIsModelLoaded] = useState(false);
	const nonce = useSnapshotNonce(furnitureId);
	const imageSrc = `${import.meta.env.VITE_PUBLIC_API_ORIGIN}/furniture/${furnitureId}/image.jpg?nonce=${nonce}`;
	const hasImage = useHasImage(imageSrc);

	const needsScreenshot = hasImage === false && !nonce && isModelLoaded;

	const triggerScreenshot = useCallback(
		async (abortSignal?: AbortSignal) => {
			const canvas = ref.current;
			if (!canvas) return;

			try {
				const blob = await new Promise<Blob>((resolve, reject) =>
					canvas.toBlob((v) => {
						if (v) resolve(v);
						else reject(new Error('Failed to write canvas to image'));
					}, 'image/jpg')
				);
				const file = new File([blob], 'screenshot.jpg', { type: 'image/jpg' });

				if (abortSignal?.aborted) return;
				// send snapshot to server
				await adminApiClient.furniture[':id'].image.$put({
					param: { id: furnitureId },
					form: { file },
				});
				setSnapshotNonce(furnitureId, new Date().toUTCString());
				removeNeedsScreenshot(furnitureId);
			} catch (err) {
				if (err instanceof Error && err.name === 'AbortError') {
					return;
				}
				console.error(err);
			}
		},
		[furnitureId]
	);

	useEffect(() => {
		if (needsScreenshot) {
			// capture canvas image
			const abortController = new AbortController();
			triggerScreenshot(abortController.signal);
			return () => {
				abortController.abort();
			};
		}
	}, [needsScreenshot, triggerScreenshot]);

	return {
		ref,
		triggerScreenshot,
		onModelLoaded: useCallback(() => setIsModelLoaded(true), []),
	};
}
