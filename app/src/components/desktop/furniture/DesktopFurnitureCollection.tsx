import { FurnitureItem } from '@/services/publicApi/furnitureHooks';
import { useSetPlacingFurniture } from '@/stores/roomStore/hooks/editing';
import { PrefixedId } from '@alef/common';
import { Button, Card, CardGrid, Icon, ScrollArea } from '@alef/sys';
import cls from './DesktopFurnitureCollection.module.css';

export interface DesktopFurnitureCollectionProps {
	furniture: FurnitureItem[];
	hasMore?: boolean;
	onLoadMore?: () => void;
	onSelect?: (id: PrefixedId<'f'>) => void;
}

export function DesktopFurnitureCollection({ furniture, hasMore, onLoadMore, onSelect }: DesktopFurnitureCollectionProps) {
	return (
		<ScrollArea>
			<CardGrid p="small">
				{furniture.map((item) => (
					<DesktopFurnitureCard key={item.id} item={item} onSelect={onSelect} />
				))}
			</CardGrid>
			{hasMore && (
				<Button color="ghost" onClick={onLoadMore}>
					<Icon name="arrow-down" />
					Load More
				</Button>
			)}
		</ScrollArea>
	);
}

function DesktopFurnitureCard({ item, onSelect }: { item: FurnitureItem; onSelect?: (id: PrefixedId<'f'>) => void }) {
	const setSelectedModelId = useSetPlacingFurniture();

	const add = () => {
		setSelectedModelId(item.id);
		onSelect?.(item.id);
	};

	return (
		<Card onClick={add} className={cls.card}>
			<Card.Main>
				<Card.Image src={`${import.meta.env.VITE_PUBLIC_API_ORIGIN}/furniture/${item.id}/image.jpg`} />
			</Card.Main>
			<Card.Details>
				<Card.Title>{item.name}</Card.Title>
			</Card.Details>
		</Card>
	);
}
