import { FurnitureItem } from '@/services/publicApi/furnitureHooks';
import { usePlacingFurnitureId, useSetPlacingFurniture } from '@/stores/propertyStore/hooks/editing';
import { Box, Button, CardGrid, Icon } from '@alef/sys';
import { DesktopFurnitureCard } from './DesktopFurnitureCard';

export interface DesktopFurnitureCollectionProps {
	furniture: FurnitureItem[];
	hasMore?: boolean;
	onLoadMore?: () => void;
	onSelect?: (item: FurnitureItem | null) => void;
}

export function DesktopFurnitureCollection({ furniture, hasMore, onLoadMore, onSelect }: DesktopFurnitureCollectionProps) {
	return (
		<Box full stacked>
			<CardGrid small>
				{furniture.map((item) => (
					<FurnitureCard key={item.id} item={item} onSelect={onSelect} />
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

function FurnitureCard({ item, onSelect }: { item: FurnitureItem; onSelect?: (item: FurnitureItem | null) => void }) {
	const selectedModelId = usePlacingFurnitureId();
	const setSelectedModelId = useSetPlacingFurniture();

	const isSelected = selectedModelId === item.id;

	const handleClick = () => {
		if (isSelected) {
			setSelectedModelId(null);
			onSelect?.(null);
		} else {
			setSelectedModelId(item.id);
			onSelect?.(item);
		}
	};

	return <DesktopFurnitureCard item={item} isSelected={isSelected} onClick={handleClick} />;
}
