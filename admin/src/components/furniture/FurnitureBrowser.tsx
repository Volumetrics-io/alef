import { publicApiClient } from '@/services/publicApi';
import { Box, Card, Frame, Text } from '@alef/sys';
import { useSuspenseQuery } from '@tanstack/react-query';
import { startTransition, useState } from 'react';
import { AttributePicker } from './AttributePicker';
import { AttributePill } from './AttributePill';
import { FurnitureModelUpload } from './FurnitureModelUpload';
import { FurniturePreview } from './FurniturePreview';

export function FurnitureBrowser() {
	const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
	const { data } = useSuspenseQuery({
		queryKey: ['furniture', ...selectedAttributes],
		queryFn: async ({ queryKey }) => {
			const [, ...attributes] = queryKey;
			const response = await publicApiClient.furniture.$get({
				query: {
					attribute: attributes,
				},
			});
			if (!response.ok) {
				throw new Error(`Error: ${response.statusText}`);
			}
			return response.json();
		},
	});

	return (
		<Box stacked gapped full>
			{/* Filter attributes */}
			<AttributePicker
				onSubmit={(attr) =>
					startTransition(() => {
						setSelectedAttributes([...selectedAttributes, `${attr.key}:${attr.value}`]);
					})
				}
			/>
			<Box>
				{selectedAttributes.map((attr) => {
					const [key, value] = attr.split(':');
					return <AttributePill key={attr} attribute={{ key, value }} onRemove={() => setSelectedAttributes((v) => v.filter((a) => a !== attr))} />;
				})}
			</Box>
			<Card.Grid full>
				{data?.map((furniture) => (
					<Card key={furniture.id}>
						<Card.Main>
							<FurniturePreview furnitureId={furniture.id} key={furniture.modelUpdatedAt} nonce={furniture.modelUpdatedAt} />
							<Box float="top-left" gapped>
								{furniture.attributes.map((attr) => (
									<Frame key={attr.key} p="squeeze">
										{attr.key}: {attr.value}
									</Frame>
								))}
							</Box>
						</Card.Main>
						<Card.Details justify="between">
							<Text strong>{furniture.name}</Text>
							<FurnitureModelUpload furnitureId={furniture.id} />
						</Card.Details>
					</Card>
				))}
			</Card.Grid>
		</Box>
	);
}
