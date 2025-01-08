import { publicApiClient } from '@/services/publicApi';
import { Box, Button, Frame, Icon } from '@alef/sys';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { AttributePicker } from './AttributePicker';

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
				{selectedAttributes.map((attr) => (
					<Frame>
						{attr}
						<Button onClick={() => setSelectedAttributes(selectedAttributes.filter((a) => a !== attr))}>
							<Icon name="x" />
						</Button>
					</Frame>
				))}
			</Box>
			<AttributePicker onSubmit={(attr) => setSelectedAttributes([...selectedAttributes, attr])} />
			<Box stacked>
				{data?.map((furniture) => (
					<Box>
						{furniture.name}
						<Box>
							{furniture.attributes.map((attr) => (
								<Frame>
									{attr.key}: {attr.value}
								</Frame>
							))}
						</Box>
					</Box>
				))}
			</Box>
		</Box>
	);
}
