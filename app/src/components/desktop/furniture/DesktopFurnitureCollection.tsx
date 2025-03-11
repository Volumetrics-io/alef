import { FurnitureItem } from '@/services/publicApi/furnitureHooks';
import { useClosestFloorCenterGetter } from '@/stores/editorStore';
import { useAddFurniture } from '@/stores/roomStore';
import { Button, Card, CardGrid, Icon, ScrollArea } from '@alef/sys';

export interface DesktopFurnitureCollectionProps {
	furniture: FurnitureItem[];
	hasMore?: boolean;
	onLoadMore?: () => void;
}

export function DesktopFurnitureCollection({ furniture, hasMore, onLoadMore }: DesktopFurnitureCollectionProps) {
	return (
		<ScrollArea>
			<CardGrid>
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
	const addFurniture = useAddFurniture();
	const getFloorCenter = useClosestFloorCenterGetter();

	const add = () => {
		addFurniture({
			furnitureId: item.id,
			position: getFloorCenter(),
			rotation: { x: 0, y: 0, z: 0, w: 1 },
		});
	};

	return (
		<Card>
			<Card.Main onClick={add}>
				<Card.Image src={`${import.meta.env.VITE_PUBLIC_API_ORIGIN}/furniture/${item.id}/image.jpg`} />
			</Card.Main>
			<Card.Details>
				<Card.Title>{item.name}</Card.Title>
			</Card.Details>
		</Card>
	);
}
