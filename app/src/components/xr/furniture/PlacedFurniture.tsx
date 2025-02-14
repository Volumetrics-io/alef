import { useAABB } from '@/hooks/useAABB';
import { useEditorStore, useIsEditorStageMode } from '@/stores/editorStore';
import { useDeleteFurniturePlacement, useFurniturePlacementDrag, useFurniturePlacementFurnitureId } from '@/stores/roomStore/roomStore';
import { PrefixedId } from '@alef/common';
import { ErrorBoundary } from '@alef/sys';
import { Billboard } from '@react-three/drei';
import { Handle, HandleTarget } from '@react-three/handle';
import { RigidBody, RoundCuboidCollider } from '@react-three/rapier';
import { Container, Root } from '@react-three/uikit';
import { colors } from '@react-three/uikit-default';
import { Trash } from '@react-three/uikit-lucide';
import { useCallback } from 'react';
import { DoubleSide } from 'three';
import { FurnitureModel } from './FurnitureModel';

export interface PlacedFurnitureProps {
	furniturePlacementId: PrefixedId<'fp'>;
}

export function PlacedFurniture({ furniturePlacementId }: PlacedFurnitureProps) {
	const furnitureId = useFurniturePlacementFurnitureId(furniturePlacementId);
	const { groupProps, dragHandleProps: handleProps, rotateHandleProps, colliderProps, rigidBodyProps } = useFurniturePlacementDrag(furniturePlacementId);
	const select = useEditorStore((s) => s.select);
	const selected = useEditorStore((s) => s.selectedId === furniturePlacementId);

	const handleClick = useCallback(() => {
		select(furniturePlacementId);
	}, [select, furniturePlacementId]);

	const { halfExtents, center, ref: modelRef, ready } = useAABB();
	const roundedArgs = [...halfExtents.map((v) => v - 0.1), 0.1] as [number, number, number, number];

	const isEditable = useIsEditorStageMode('furniture') && selected;

	if (!furnitureId) return null;

	return (
		<ErrorBoundary fallback={null}>
			<HandleTarget>
				<RigidBody {...rigidBodyProps} colliders={false}>
					{ready && <RoundCuboidCollider args={roundedArgs} position={center} {...colliderProps} />}
					<group onClick={handleClick} {...groupProps}>
						{isEditable ? (
							<Handle {...handleProps} targetRef="from-context">
								<FurnitureModel furnitureId={furnitureId} outline={selected} ref={modelRef} />
							</Handle>
						) : (
							<FurnitureModel furnitureId={furnitureId} ref={modelRef} />
						)}
						{isEditable && <DeleteUI furniturePlacementId={furniturePlacementId} height={halfExtents[1] + center.y + 0.2} />}
						{isEditable && rotateHandleProps && (
							<Handle targetRef="from-context" {...rotateHandleProps}>
								<mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
									<ringGeometry args={[halfExtents[0] * 1.5, halfExtents[0] * 1.5 + 0.16, 32]} />
									<meshBasicMaterial color="white" side={DoubleSide} />
								</mesh>
							</Handle>
						)}
					</group>
				</RigidBody>
			</HandleTarget>
		</ErrorBoundary>
	);
}

function DeleteUI({ furniturePlacementId, height }: { furniturePlacementId: PrefixedId<'fp'>; height: number }) {
	const handleDelete = useDeleteFurniturePlacement(furniturePlacementId);

	return (
		<Billboard position={[0, height, 0]}>
			<Root pixelSize={0.005}>
				<Container padding={2} backgroundColor={colors.destructive} borderRadius={5} onClick={handleDelete}>
					<Trash />
				</Container>
			</Root>
		</Billboard>
	);
}
