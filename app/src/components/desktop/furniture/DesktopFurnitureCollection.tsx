import { FurnitureItem } from '@/services/publicApi/furnitureHooks';
import { usePlacingFurnitureId, useSetPlacingFurniture } from '@/stores/roomStore/hooks/editing';
import { Box, Button, CardGrid, Icon } from '@alef/sys';
import { DesktopFurnitureCard } from './DesktopFurnitureCard';

export interface DesktopFurnitureCollectionProps {
	furniture: FurnitureItem[];
	hasMore?: boolean;
	onLoadMore?: () => void;
}

export function DesktopFurnitureCollection({ furniture, hasMore, onLoadMore }: DesktopFurnitureCollectionProps) {
	return (
		<Box full stacked>
			<CardGrid small>
				{furniture.map((item) => (
					<FurnitureCard key={item.id} item={item} />
				))}
			</CardGrid>
			{hasMore && (
				<Button color="ghost" onClick={onLoadMore}>
					<Icon name="arrow-down" />
					Load More
				</Button>
			)}
		</Box>
	);
}

function FurnitureCard({ item }: { item: FurnitureItem }) {
	const selectedModelId = usePlacingFurnitureId();
	const setSelectedModelId = useSetPlacingFurniture();

	const isSelected = selectedModelId === item.id;

	const handleClick = () => {
		if (isSelected) {
			setSelectedModelId(null);
		} else {
			setSelectedModelId(item.id);
		}
	};

	return <DesktopFurnitureCard item={item} isSelected={isSelected} onClick={handleClick} />;
}
