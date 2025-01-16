import { useFurniturePlacementFurnitureId, useFurniturePlacementPosition } from '@/stores/roomStore';
import { PrefixedId } from '@alef/common';
import { FurnitureModel } from './FurnitureModel';

export interface PlacedFurnitureProps {
	furniturePlacementId: PrefixedId<'fp'>;
}

export function PlacedFurniture({ furniturePlacementId }: PlacedFurnitureProps) {
	const furnitureId = useFurniturePlacementFurnitureId(furniturePlacementId);
	const { beginDrag, commitDrag, cancelDrag, onDrag, groupRef } = useFurniturePlacementPosition(furniturePlacementId);

	return (
		<group ref={groupRef} onPointerDown={beginDrag} onPointerUp={commitDrag} onPointerCancel={cancelDrag} onPointerMove={onDrag}>
			<FurnitureModel furnitureId={furnitureId} />
		</group>
	);
}
