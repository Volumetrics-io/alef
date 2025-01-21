import { useVibrateOnHover } from '@/hooks/useVibrateOnHover';
import { useEditorStore } from '@/stores/editorStore';
import { useFurniturePlacementDrag, useFurniturePlacementFurnitureId } from '@/stores/roomStore';
import { PrefixedId } from '@alef/common';
import { PivotHandles } from '@react-three/handle';
import { RigidBody } from '@react-three/rapier';
import { useCallback } from 'react';
import { FurnitureModel } from './FurnitureModel';

export interface PlacedFurnitureProps {
	furniturePlacementId: PrefixedId<'fp'>;
}

export function PlacedFurniture({ furniturePlacementId }: PlacedFurnitureProps) {
	const furnitureId = useFurniturePlacementFurnitureId(furniturePlacementId);
	const { handleProps, rigidBodyRef } = useFurniturePlacementDrag(furniturePlacementId);
	const select = useEditorStore((s) => s.select);

	const handleClick = useCallback(() => {
		select(furniturePlacementId);
	}, [select, furniturePlacementId]);
	const groupRef = useVibrateOnHover();

	return (
		<RigidBody type="kinematicPosition" colliders="cuboid" ref={rigidBodyRef}>
			<group onClick={handleClick} ref={groupRef}>
				<PivotHandles {...handleProps}>
					<FurnitureModel furnitureId={furnitureId} />
				</PivotHandles>
			</group>
		</RigidBody>
	);
}
