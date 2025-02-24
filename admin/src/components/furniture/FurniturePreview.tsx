import { adminApiClient } from '@/services/adminApi';
import { setSnapshotNonce, useSnapshotNonce } from '@/state/snapshotNonces';
import { FurnitureModelQuality, PrefixedId } from '@alef/common';
import { Box, Control, ErrorBoundary, Icon, Select } from '@alef/sys';
import { Environment, Gltf, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FurnitureSnapshot } from './FurnitureSnapshot';

export interface FurniturePreviewProps {
	furnitureId: PrefixedId<'f'>;
	nonce?: string | null;
}

export function FurniturePreview({ furnitureId, nonce = 'none' }: FurniturePreviewProps) {
	const [quality, setQuality] = useState<FurnitureModelQuality>(FurnitureModelQuality.Original);
	const modelSrc = `${import.meta.env.VITE_PUBLIC_API_ORIGIN}/furniture/${furnitureId}/model?nonce=${nonce}&quality=${quality}`;

	const { ref: canvasRef, triggerScreenshot } = useScreenshot(furnitureId);

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
					camera={{ position: [0, 1.5, 2] }}
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
					<OrbitControls makeDefault target={[0, 1, 0]} />
					<Gltf
						src={modelSrc}
						extendLoader={(loader) => {
							loader.setWithCredentials(true);
						}}
					/>
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

function useHasImage(imageSrc: string) {
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
	const nonce = useSnapshotNonce(furnitureId);
	const imageSrc = `${import.meta.env.VITE_PUBLIC_API_ORIGIN}/furniture/${furnitureId}/image.jpg?nonce=${nonce}`;
	const hasImage = useHasImage(imageSrc);

	const needsScreenshot = hasImage === false && !nonce;

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
	};
}
