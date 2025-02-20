import { useAABB } from '@/hooks/useAABB';
import { useEditorStore, useIsEditorStageMode } from '@/stores/editorStore';
import { useDeleteFurniturePlacement, useFurniturePlacement, useFurniturePlacementFurnitureId, useUpdateFurniturePlacementTransform } from '@/stores/roomStore/roomStore';
import { PrefixedId } from '@alef/common';
import { Billboard, Bvh } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { Handle } from '@react-three/handle';
import { Container, Root } from '@react-three/uikit';
import { colors } from '@react-three/uikit-default';
import { Trash } from '@react-three/uikit-lucide';
import { useCallback, useRef } from 'react';
import { Group } from 'three';
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
		if (selected) return;
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

	const hypotenuse = Math.sqrt(halfExtents[0] * halfExtents[0] + halfExtents[2] * halfExtents[2])

	const isEditable = useIsEditorStageMode('furniture') && ready;

	if (!furnitureId || !placement) return null;

	return (
		<group
			ref={groupRef}
			position={[placement.position.x, placement.position.y, placement.position.z]}
			quaternion={[placement.rotation.x, placement.rotation.y, placement.rotation.z, placement.rotation.w]}
		>
			{isEditable ? (
				<Handle targetRef={groupRef as any} translate={{ x: true, y: false, z: true }} scale={false} rotate={false}>
					<Bvh firstHitOnly={true} onClick={handleClick} onPointerUp={handlePointerUpDrag} onPointerOut={handlePointerUpDrag} onPointerLeave={handlePointerUpDrag}>
						<FurnitureModel furnitureId={furnitureId} ref={modelRef} castShadow={size.y > 0.2} />
					</Bvh>
				</Handle>
			) : (
				<FurnitureModel furnitureId={furnitureId} ref={modelRef} castShadow={size.y > 0.2} receiveShadow={size.y < 0.2} pointerEvents="none" />
			)}

			{isEditable && selected && <DeleteUI furniturePlacementId={furniturePlacementId} height={halfExtents[1] + center.y + 0.2} />}
			{isEditable && selected && (
				<Handle targetRef={groupRef as any} rotate={{ x: false, y: true, z: false }} translate="as-rotate">
					<mesh
						onPointerUp={handlePointerUpRotate}
						onPointerOut={handlePointerUpRotate}
						onPointerLeave={handlePointerUpRotate}
						position={[0, 0.2, 0]}
						rotation={[Math.PI / 2, 0, 0]}
						renderOrder={-2}
						
					>
						<torusGeometry args={[hypotenuse + 0.1, 0.025, 64]} />
						<meshPhongMaterial color="#1d7e7f" emissive="#1d7e7f" emissiveIntensity={0.5} />
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
