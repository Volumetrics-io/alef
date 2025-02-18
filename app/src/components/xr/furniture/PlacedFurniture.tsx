import { useAABB } from '@/hooks/useAABB';
import { useEditorStore, useIsEditorStageMode } from '@/stores/editorStore';
import { useDeleteFurniturePlacement, useFurniturePlacement, useFurniturePlacementFurnitureId, useUpdateFurniturePlacementTransform } from '@/stores/roomStore/roomStore';
import { PrefixedId } from '@alef/common';
import { Billboard } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { Handle } from '@react-three/handle';
import { Container, Root } from '@react-three/uikit';
import { colors } from '@react-three/uikit-default';
import { Trash } from '@react-three/uikit-lucide';
import { Suspense, useCallback, useRef } from 'react';
import { DoubleSide, Group } from 'three';
import { FurnitureModel } from './FurnitureModel';
export interface PlacedFurnitureProps {
	furniturePlacementId: PrefixedId<'fp'>;
}

export function PlacedFurniture({ furniturePlacementId }: PlacedFurnitureProps) {
	const furnitureId = useFurniturePlacementFurnitureId(furniturePlacementId);
	const placement = useFurniturePlacement(furniturePlacementId);
	const select = useEditorStore((s) => s.select);
	const selected = useEditorStore((s) => s.selectedId === furniturePlacementId);
	const { gl } = useThree();

	const groupRef = useRef<Group>(null);
	const move = useUpdateFurniturePlacementTransform(furniturePlacementId);
	const handleClick = useCallback(() => {
		select(furniturePlacementId);
	}, [select, furniturePlacementId]);

	const handlePointerUpDrag = useCallback(() => {
		if (!groupRef.current) return;
		gl.shadowMap.needsUpdate = true;

		move({ position: groupRef.current.position, rotation: groupRef.current.quaternion });
	}, [move, groupRef]);

	const handlePointerUpRotate = useCallback(() => {
		if (!groupRef.current) return;
		gl.shadowMap.needsUpdate = true;

		move({ position: groupRef.current.position, rotation: groupRef.current.quaternion });
	}, [move, groupRef]);

	const { halfExtents, size, center, ref: modelRef, ready } = useAABB();

	const isEditable = useIsEditorStageMode('furniture') && ready;

	if (!furnitureId || !placement) return null;

	return (
		<group
			onClick={handleClick}
			ref={groupRef}
			position={[placement.position.x, placement.position.y, placement.position.z]}
			quaternion={[placement.rotation.x, placement.rotation.y, placement.rotation.z, placement.rotation.w]}
		>
			{isEditable && (
				<Handle targetRef={groupRef as any} translate={{ x: true, y: false, z: true }} scale={false} rotate={false}>
					<mesh position={center} onPointerUp={handlePointerUpDrag} onPointerOut={handlePointerUpDrag} onPointerLeave={handlePointerUpDrag}>
						<boxGeometry args={[size.x, size.y, size.z]} />
						<meshBasicMaterial opacity={0} transparent={true} />
					</mesh>
				</Handle>
			)}
			<Suspense
				fallback={
					<mesh position={center} onPointerUp={handlePointerUpDrag} onPointerOut={handlePointerUpDrag} onPointerLeave={handlePointerUpDrag}>
						<boxGeometry args={[size.x, size.y, size.z]} />
						<meshBasicMaterial opacity={0.3} transparent={true} />
					</mesh>
				}
			>
				<FurnitureModel furnitureId={furnitureId} ref={modelRef} castShadow={size.y > 0.2} receiveShadow={size.y < 0.2} />
			</Suspense>

			{isEditable && selected && <DeleteUI furniturePlacementId={furniturePlacementId} height={halfExtents[1] + center.y + 0.2} />}
			{isEditable && selected && (
				<Handle targetRef={groupRef as any} rotate={{ x: false, y: true, z: false }} translate="as-rotate">
					<mesh
						onPointerUp={handlePointerUpRotate}
						onPointerOut={handlePointerUpRotate}
						onPointerLeave={handlePointerUpRotate}
						position={[0, 0.01, 0]}
						rotation={[Math.PI / 2, 0, 0]}
					>
						<ringGeometry args={[halfExtents[0] * 1.5, halfExtents[0] * 1.5 + 0.16, 64]} />
						<meshBasicMaterial color="white" side={DoubleSide} />
					</mesh>
				</Handle>
			)}
		</group>
	);
}

function DeleteUI({ furniturePlacementId, height }: { furniturePlacementId: PrefixedId<'fp'>; height: number }) {
	const handleDelete = useDeleteFurniturePlacement(furniturePlacementId);

	return (
		<Billboard lockX lockZ position={[0, height, 0]}>
			<Root pixelSize={0.005}>
				<Container padding={2} backgroundColor={colors.destructive} borderRadius={5} onClick={handleDelete}>
					<Trash />
				</Container>
			</Root>
		</Billboard>
	);
}
