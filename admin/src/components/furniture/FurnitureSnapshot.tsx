import { useSnapshotNonce } from '@/state/snapshotNonces';
import { PrefixedId } from '@alef/common';
import { addNeedsScreenshot } from '@/stores/furnitureStore';
import { useEffect } from 'react';
import { useHasImage } from './FurniturePreview';
export interface FurnitureSnapshotProps {
	furnitureId: PrefixedId<'f'>;
}

export function FurnitureSnapshot({ furnitureId }: FurnitureSnapshotProps) {
	// triggers a refetch of the snapshot whenever the value changes -- the value is set by
	// an upload elsewhere.l
	const nonce = useSnapshotNonce(furnitureId);
	const hasImage = useHasImage(`${import.meta.env.VITE_PUBLIC_API_ORIGIN}/furniture/${furnitureId}/image.jpg?nonce=${nonce}`);

	useEffect(() => {
		if (hasImage === false && !nonce) {
			addNeedsScreenshot(furnitureId);
		}
	}, [furnitureId, nonce, hasImage]);

	return (
		<img
			src={`${import.meta.env.VITE_PUBLIC_API_ORIGIN}/furniture/${furnitureId}/image.jpg?nonce=${nonce}`}
			crossOrigin="anonymous"
			style={{
				aspectRatio: '1/1',
				width: 200,
				height: 'auto',
				objectFit: 'contain',
			}}
		/>
	);
}
