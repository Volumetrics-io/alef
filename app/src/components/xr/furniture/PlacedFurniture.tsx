import { useFurniturePlacementDrag, useFurniturePlacementFurnitureId } from '@/stores/roomStore';
import { PrefixedId } from '@alef/common';
import { RigidBody } from '@react-three/rapier';
import { FurnitureModel } from './FurnitureModel';

export interface PlacedFurnitureProps {
	furniturePlacementId: PrefixedId<'fp'>;
}

export function PlacedFurniture({ furniturePlacementId }: PlacedFurnitureProps) {
	const furnitureId = useFurniturePlacementFurnitureId(furniturePlacementId);
	const { handleProps, rigidBodyRef } = useFurniturePlacementDrag(furniturePlacementId);

	return (
		<RigidBody type="kinematicPosition" colliders="cuboid" ref={rigidBodyRef}>
			<group {...handleProps}>
				<FurnitureModel furnitureId={furnitureId} />
			</group>
		</RigidBody>
	);
}
