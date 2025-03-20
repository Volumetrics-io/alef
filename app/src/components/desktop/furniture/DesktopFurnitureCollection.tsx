import { FurnitureItem } from '@/services/publicApi/furnitureHooks';
import { useSetSelectedModelId } from '@/stores/editorStore';
import { Button, Card, CardGrid, Icon, ScrollArea } from '@alef/sys';
import cls from './DesktopFurnitureCollection.module.css';

export interface DesktopFurnitureCollectionProps {
	furniture: FurnitureItem[];
	hasMore?: boolean;
	onLoadMore?: () => void;
}

export function DesktopFurnitureCollection({ furniture, hasMore, onLoadMore }: DesktopFurnitureCollectionProps) {
	return (
		<ScrollArea>
			<CardGrid small p="small">
				{furniture.map((item) => (
					<DesktopFurnitureCard key={item.id} item={item} />
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

function DesktopFurnitureCard({ item }: { item: FurnitureItem }) {
	const setSelectedModelId = useSetSelectedModelId();

	const add = () => {
		setSelectedModelId(item.id);
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
