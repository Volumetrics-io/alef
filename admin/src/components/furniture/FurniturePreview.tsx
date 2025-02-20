import { adminApiClient } from '@/services/adminApi';
import { Box, Control, ErrorBoundary, Icon } from '@alef/sys';
import { Environment, Gltf, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface FurniturePreviewProps {
	furnitureId: string;
	nonce?: string | null;
}

export function FurniturePreview({ furnitureId, nonce = 'none' }: FurniturePreviewProps) {
	const modelSrc = `${import.meta.env.VITE_PUBLIC_API_ORIGIN}/furniture/${furnitureId}/model?nonce=${nonce}`;

	const { ref: canvasRef, triggerScreenshot, nonce: screenshotNonce } = useScreenshot(furnitureId);

	return (
		<ErrorBoundary
			fallback={
				<Box full layout="center center">
					No model
				</Box>
			}
		>
			<Box>
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
				<Control float="bottom-right" onClick={() => triggerScreenshot()}>
					<img
						src={`${import.meta.env.VITE_PUBLIC_API_ORIGIN}/furniture/${furnitureId}/image.jpg?nonce=${screenshotNonce}`}
						crossOrigin="anonymous"
						style={{
							aspectRatio: '1/1',
							width: 200,
							height: 'auto',
							objectFit: 'contain',
						}}
					/>
					<Box float="bottom-right">
						<Icon name="refresh-cw" />
					</Box>
				</Control>
			</Box>
		</ErrorBoundary>
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

function useScreenshot(furnitureId: string) {
	const ref = useRef<HTMLCanvasElement>(null);
	const [lastScreenshotAt, setLastScreenshotAt] = useState<Date | null>(null);
	const imageSrc = `${import.meta.env.VITE_PUBLIC_API_ORIGIN}/furniture/${furnitureId}/image.jpg?nonce=${lastScreenshotAt?.toISOString()}`;
	const hasImage = useHasImage(imageSrc);

	const needsScreenshot = hasImage === false && !lastScreenshotAt;

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
				setLastScreenshotAt(new Date());
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
		nonce: lastScreenshotAt?.toISOString(),
	};
}
