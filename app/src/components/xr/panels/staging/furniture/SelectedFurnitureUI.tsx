import { BodyAnchor } from '@/components/xr/anchors/BodyAnchor';
import { useDeleteFurniturePlacement, useFurniturePlacement, useFurnitureQuickSwap } from '@/stores/propertyStore';
import { useSelectedFurniturePlacementId } from '@/stores/propertyStore/hooks/editing';
import { RoomFurniturePlacement } from '@alef/common';
import { Container, ContainerProperties, Root } from '@react-three/uikit';
import { ArrowLeft, ArrowRight, Trash } from '@react-three/uikit-lucide';
import { Button } from '../../../ui/Button';

export function SelectedFurnitureWidget({ ...props }: ContainerProperties) {
	const selected = useSelectedFurniturePlacementId();
	const placement = useFurniturePlacement(selected || 'fp-none');

	if (!placement) return null;

	return <SelectedFurnitureUI placement={placement} {...props} />;
}

export function SelectedFurnitureUIRoot() {
	return (
		<BodyAnchor lockY position={[0, -0.3, 0.75]} follow={true}>
			<Root pixelSize={0.001}>
				<SelectedFurnitureWidget />
			</Root>
		</BodyAnchor>
	);
}

const SelectedFurnitureUI = ({ placement, ...props }: { placement: RoomFurniturePlacement } & ContainerProperties) => {
	const handleDelete = useDeleteFurniturePlacement(placement.id);
	const { swapPrevious, swapNext } = useFurnitureQuickSwap(placement);

	return (
		<Container flexDirection="row" gap={10} {...props}>
			<Button variant="link" onClick={swapPrevious}>
				<ArrowLeft />
			</Button>
			<Button variant="destructive" onClick={handleDelete}>
				<Trash />
			</Button>
			<Button variant="link" onClick={swapNext}>
				<ArrowRight />
			</Button>
		</Container>
	);
};
