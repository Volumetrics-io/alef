import { adminApiClient } from '@/services/adminApi';
import { handleErrors } from '@/services/utils';
import { Box, Frame, ScrollArea, Spinner } from '@alef/sys';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { FurniturePreview } from './FurniturePreview';

export function FurnitureProcessingQueue() {
	const { data: unprocessedFurniture } = useSuspenseQuery({
		queryKey: ['furniture', 'unprocessed'],
		queryFn: () => handleErrors(adminApiClient.furniture.unprocessed.$get()),
	});

	const [itemIndex, setItemIndex] = useState(0);
	const [errors, setErrors] = useState<Error[]>([]);
	const addError = (err: Error) => setErrors((errs) => [...errs, err]);

	if (!unprocessedFurniture.length || itemIndex >= unprocessedFurniture.length) {
		return null;
	}

	const item = unprocessedFurniture[itemIndex];

	return (
		<Frame float="bottom-right" stacked gapped elevated style={{ width: 300 }}>
			<FurniturePreview
				key={item.id}
				forceUpdate
				furnitureId={item.id}
				onMetadataUpdated={(err) => {
					if (err) {
						addError(err);
					}
					setItemIndex((i) => i + 1);
				}}
			/>
			<Box p="squeeze" gapped>
				<Spinner />
				Processing {itemIndex + 1} of {unprocessedFurniture.length}
			</Box>
			{!!errors.length && (
				<Box p="squeeze" gapped stacked style={{ width: '100%', maxHeight: 300 }}>
					<ScrollArea>
						{errors.map((err, i) => (
							<Box key={i} style={{ backgroundColor: 'var(--error-paper)', color: 'var(--error-ink)', whiteSpace: 'wrap' }}>
								{err.message}
							</Box>
						))}
					</ScrollArea>
				</Box>
			)}
		</Frame>
	);
}
