import { Card } from '@alef/sys';
import { FurnitureItem } from '@/services/publicApi/furnitureHooks';
import clsx from 'clsx';
import cls from './DesktopFurnitureCard.module.css';

interface DesktopFurnitureCardProps {
	item: FurnitureItem;
	isSelected: boolean;
	onClick?: () => void;
}

export function DesktopFurnitureCard({ item, isSelected, onClick }: DesktopFurnitureCardProps) {
	return (
		<Card onClick={onClick} className={clsx(cls.card, isSelected && cls.cardSelected)}>
			<Card.Main>
				<Card.Image src={`${import.meta.env.VITE_PUBLIC_API_ORIGIN}/furniture/${item.id}/image.jpg`} />
			</Card.Main>
			<Card.Details>
				<Card.Title>{item.name}</Card.Title>
			</Card.Details>
		</Card>
	);
}
