import { useFurniturePlacementFurnitureId } from '@/stores/roomStore';
import { PrefixedId } from '@alef/common';
import { PhysicsDraggable, PhysicsDragHandle } from '../controls/PhysicsDraggable';
import { FurnitureModel } from './FurnitureModel';

export interface PlacedFurnitureProps {
	furniturePlacementId: PrefixedId<'fp'>;
}

export function PlacedFurniture({ furniturePlacementId }: PlacedFurnitureProps) {
	const furnitureId = useFurniturePlacementFurnitureId(furniturePlacementId);

	return (
		<PhysicsDraggable
			onRest={(position) => {
				// Save the new position
				// NOTE: This is where we would update the position in the store
			}}
		>
			<PhysicsDragHandle>
				<FurnitureModel furnitureId={furnitureId} />
			</PhysicsDragHandle>
		</PhysicsDraggable>
	);
}
