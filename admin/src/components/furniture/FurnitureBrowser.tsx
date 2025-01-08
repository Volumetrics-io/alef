import { publicApiClient } from '@/services/publicApi';
import { Box, Card, Frame, Text } from '@alef/sys';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { AttributePicker } from './AttributePicker';
import { AttributePill } from './AttributePill';

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
		<Box stacked>
			{/* Selected attributes */}
			<Box>
				{selectedAttributes.map((attr) => {
					const [key, value] = attr.split(':');
					return <AttributePill key={key} attribute={{ key, value }} onRemove={() => setSelectedAttributes((v) => v.filter((a) => a !== attr))} />;
				})}
			</Box>
			<AttributePicker onSubmit={(attr) => setSelectedAttributes([...selectedAttributes, `${attr.key}:${attr.value}`])} />
			<Card.Grid>
				{data?.map((furniture) => (
					<Card key={furniture.id}>
						<Card.Main>
							<Box>
								{furniture.attributes.map((attr) => (
									<Frame>
										{attr.key}: {attr.value}
									</Frame>
								))}
							</Box>
						</Card.Main>
						<Card.Details>
							<Text strong>{furniture.name}</Text>
						</Card.Details>
					</Card>
				))}
			</Card.Grid>
		</Box>
	);
}
