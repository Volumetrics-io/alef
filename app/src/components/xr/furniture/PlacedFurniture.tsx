import { useFurniturePlacementFurnitureId, useFurniturePlacementPosition } from '@/stores/roomStore';
import { PrefixedId } from '@alef/common';
import { RigidBody } from '@react-three/rapier';
import { FurnitureModel } from './FurnitureModel';

export interface PlacedFurnitureProps {
	furniturePlacementId: PrefixedId<'fp'>;
}

export function PlacedFurniture({ furniturePlacementId }: PlacedFurnitureProps) {
	const furnitureId = useFurniturePlacementFurnitureId(furniturePlacementId);
	const { beginDrag, commitDrag, cancelDrag, onDrag, groupRef, rigidBodyRef } = useFurniturePlacementPosition(furniturePlacementId);

	return (
		<RigidBody type="kinematicPosition" colliders="hull" ref={rigidBodyRef}>
			<group ref={groupRef} onPointerDown={beginDrag} onPointerUp={commitDrag} onPointerCancel={cancelDrag} onPointerMove={onDrag}>
				<FurnitureModel furnitureId={furnitureId} />
			</group>
		</RigidBody>
	);
}
