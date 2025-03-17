import { useFurniturePlacement, useFurnitureQuickSwap } from '@/stores/roomStore';
import { Container, ContainerProperties, Root } from '@react-three/uikit';
import { ArrowLeft, ArrowRight, Trash } from '@react-three/uikit-lucide';
import { Button } from '../../../ui/Button';
import { useDeleteFurniturePlacement } from '@/stores/roomStore';
import { RoomFurniturePlacement } from '@alef/common';
import { useEditorStore } from '@/stores/editorStore';
import { BodyAnchor } from '@/components/xr/anchors/BodyAnchor';

export function SelectedFurnitureWidget({ ...props }: ContainerProperties) {
	const selected = useEditorStore((s) => s.selectedId);
	const placement = useFurniturePlacement(selected as `fp-${string}`);

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
