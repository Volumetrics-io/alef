import { useFurniturePlacement, useFurniturePlacementIds } from '@/stores/roomStore';
import { PrefixedId } from '@alef/common';
import { SnapAnchor } from '../anchors/SnapAnchor';
import { Environment } from '../Environment';
import { FurnitureModel } from '../furniture/FurnitureModel';

export function RoomRenderer() {
	const furniturePlacementIds = useFurniturePlacementIds();

	return (
		<Environment>
			{furniturePlacementIds.map((furniturePlacementId) => {
				return <RoomFurniture key={furniturePlacementId} furniturePlacementId={furniturePlacementId} />;
			})}
		</Environment>
	);
}

function RoomFurniture({ furniturePlacementId }: { furniturePlacementId: PrefixedId<'fp'> }) {
	const placement = useFurniturePlacement(furniturePlacementId);

	return (
		<SnapAnchor label={placement.anchorLabel} padding={placement.padding}>
			<FurnitureModel furnitureId={placement.furnitureId} />
		</SnapAnchor>
	);
}
