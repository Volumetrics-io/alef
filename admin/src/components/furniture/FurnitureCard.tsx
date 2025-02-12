import { adminApiClient } from '@/services/adminApi';
import { FurnitureData } from '@/services/publicApi';
import { queryClient } from '@/services/queryClient';
import { handleErrors } from '@/services/utils';
import { Box, Button, Card, Frame, Icon, Text } from '@alef/sys';
import { useMutation } from '@tanstack/react-query';
import { FurnitureModelUpload } from './FurnitureModelUpload';
import { FurniturePreview } from './FurniturePreview';

export interface FurnitureCardProps {
	furniture: FurnitureData;
}

export function FurnitureCard({ furniture }: FurnitureCardProps) {
	const { mutate: deleteSelf, isPending } = useMutation({
		mutationFn: () => handleErrors(adminApiClient.furniture[':id'].$delete({ param: { id: furniture.id } })),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['furniture'],
			});
		},
	});

	return (
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
				<Button color="destructive" onClick={() => deleteSelf()} loading={isPending}>
					<Icon name="trash" />
				</Button>
			</Card.Details>
		</Card>
	);
}
