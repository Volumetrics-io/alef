import { useVibrateOnHover } from '@/hooks/useVibrateOnHover';
import { useEditorStore } from '@/stores/editorStore';
import { useDeleteFurniturePlacement, useFurniturePlacementDrag, useFurniturePlacementFurnitureId } from '@/stores/roomStore';
import { PrefixedId } from '@alef/common';
import { PivotHandles } from '@react-three/handle';
import { RigidBody } from '@react-three/rapier';
import { Container, Root } from '@react-three/uikit';
import { colors } from '@react-three/uikit-default';
import { Trash } from '@react-three/uikit-lucide';
import { useCallback } from 'react';
import { Billboard } from '../Billboard';
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
				<DeleteUI furniturePlacementId={furniturePlacementId} />
			</group>
		</RigidBody>
	);
}

function DeleteUI({ furniturePlacementId }: { furniturePlacementId: PrefixedId<'fp'> }) {
	const selectedFurniturePlacementId = useEditorStore((s) => s.selectedFurniturePlacementId);
	const isSelected = selectedFurniturePlacementId === furniturePlacementId;
	const handleDelete = useDeleteFurniturePlacement(furniturePlacementId);

	if (!isSelected) {
		return null;
	}

	return (
		<Billboard position={[0, 1, 0]}>
			<Root pixelSize={0.001}>
				<Container padding={2} backgroundColor={colors.destructive} borderRadius={5} onClick={handleDelete}>
					<Trash />
				</Container>
			</Root>
		</Billboard>
	);
}
