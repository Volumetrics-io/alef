import { useAABB } from '@/hooks/useAABB';
import { useEditorStore, useIsEditorStageMode } from '@/stores/editorStore';
import { useDeleteFurniturePlacement, useFurniturePlacement, useFurniturePlacementFurnitureId, useSetFurniturePlacementFurnitureId, useUpdateFurniturePlacementTransform } from '@/stores/roomStore/roomStore';
import { PrefixedId } from '@alef/common';
import { Bvh } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { Handle } from '@react-three/handle';
import { Container, Root } from '@react-three/uikit';
import { Button, colors } from '@react-three/uikit-default';
import { ArrowLeft, ArrowRight, Trash } from '@react-three/uikit-lucide';
import { useCallback, useEffect, useRef } from 'react';
import { Group } from 'three';
import { CollisionModel, FurnitureModel } from './FurnitureModel';
import { Billboard } from '../Billboard';
import { Surface } from '../ui/Surface';
import { useFurnitureDetails, useAllFurniture } from '@/services/publicApi/furnitureHooks';

export interface PlacedFurnitureProps {
	furniturePlacementId: PrefixedId<'fp'>;
}

export function PlacedFurniture({ furniturePlacementId }: PlacedFurnitureProps) {
	const furnitureId = useFurniturePlacementFurnitureId(furniturePlacementId);
	const placement = useFurniturePlacement(furniturePlacementId);
	const setFurnitureId = useSetFurniturePlacementFurnitureId();
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
			{isEditable && (
				<Handle targetRef={groupRef as any} translate={{ x: true, y: false, z: true }} scale={false} rotate={false}>
					<Bvh firstHitOnly={true} onClick={handleClick} onPointerDown={handleClick} onPointerUp={handlePointerUpDrag} onPointerOut={handlePointerUpDrag} onPointerLeave={handlePointerUpDrag}>
						<CollisionModel furnitureId={furnitureId} />
					</Bvh>
				</Handle>
			)}
			<FurnitureModel furnitureId={furnitureId} ref={modelRef} castShadow={size.y > 0.2} receiveShadow={size.y < 0.2} pointerEvents="none" />

			{isEditable && selected && <PlaceFurnitureUI furniturePlacementId={furniturePlacementId} furnitureId={furnitureId} setFurnitureId={setFurnitureId} height={halfExtents[1] + center.y + 0.2} />}
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

function PlaceFurnitureUI({ furniturePlacementId, furnitureId, setFurnitureId, height }: { furniturePlacementId: PrefixedId<'fp'>; furnitureId: PrefixedId<'f'>; setFurnitureId: (id: PrefixedId<'fp'>, furnitureId: PrefixedId<'f'>) => Promise<string>; height: number }) {
	const handleDelete = useDeleteFurniturePlacement(furniturePlacementId);

	const { data: currentFurniture } = useFurnitureDetails(furnitureId);
	const { data: furniture } = useAllFurniture({
		attributeFilter: currentFurniture?.attributes,
	});

	const furnitureIds = furniture.map((f) => f.id).sort();
	
	const handlePrevious = () => {
		const index = furnitureIds.findIndex((f) => f === furnitureId);
		if (index > 0) {
			setFurnitureId(furniturePlacementId, furnitureIds[index - 1]);
		}
	};

	const handleNext = () => {
		const index = furnitureIds.findIndex((f) => f === furnitureId);
		if (index < furnitureIds.length - 1) {
			setFurnitureId(furniturePlacementId, furnitureIds[index + 1]);
		}
	};

	return (
		<Billboard lockX lockZ position={[0, height, 0]}>
			<Root pixelSize={0.005}>
				<Container width="100%" height="100%" gap={20}>
					<Button borderRadius={5} onClick={handlePrevious}>
						<ArrowLeft />
					</Button>
					<Button backgroundColor={colors.destructive} borderRadius={5} onClick={handleDelete}>
						<Trash />
					</Button>
					<Button borderRadius={5} onClick={handleNext}>
						<ArrowRight />
					</Button>
				</Container>
			</Root>
		</Billboard>
	);
}
