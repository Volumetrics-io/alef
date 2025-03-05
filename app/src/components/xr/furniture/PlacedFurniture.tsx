import { useAABB } from '@/hooks/useAABB';
import { useAllFurniture, useFurnitureDetails } from '@/services/publicApi/furnitureHooks';
import { useEditorStore } from '@/stores/editorStore';
import {
	useDeleteFurniturePlacement,
	useFurniturePlacement,
	useFurniturePlacementFurnitureId,
	useSetFurniturePlacementFurnitureId,
	useUpdateFurniturePlacementTransform,
} from '@/stores/roomStore';
import { PrefixedId } from '@alef/common';
import { useThree } from '@react-three/fiber';
import { defaultApply, Handle, HandleState } from '@react-three/handle';
import { Container, Root } from '@react-three/uikit';
import { ArrowLeft, ArrowRight, Trash } from '@react-three/uikit-lucide';
import { ComponentPropsWithoutRef, useCallback, useRef, useState } from 'react';
import { BackSide, Group, Object3D } from 'three';
import { Billboard } from '../Billboard';
import { Button } from '../ui/Button';
import { colors } from '../ui/theme';
import { CollisionModel, FurnitureModel } from './FurnitureModel';

export interface PlacedFurnitureProps {
	furniturePlacementId: PrefixedId<'fp'>;
}

export function PlacedFurniture({ furniturePlacementId }: PlacedFurnitureProps) {
	const furnitureId = useFurniturePlacementFurnitureId(furniturePlacementId);
	const placement = useFurniturePlacement(furniturePlacementId);
	const setFurnitureId = useSetFurniturePlacementFurnitureId();
	const select = useEditorStore((s) => s.select);
	const selected = useEditorStore((s) => s.selectedId === furniturePlacementId);
	const mode = useEditorStore((s) => s.mode);

	const { gl } = useThree();

	const groupRef = useRef<Group>(null);
	const move = useUpdateFurniturePlacementTransform(furniturePlacementId);

	const { halfExtents, size, center, ref: modelRef, ready } = useAABB();
	const isEditable = ready && mode === 'furniture';
	console.log('isEditable', isEditable, ready, mode);

	const handleClick = useCallback(() => {
		console.log('handleClick', furniturePlacementId, selected, isEditable);
		if (selected) return;
		if (!isEditable) return;
		select(furniturePlacementId);
	}, [select, furniturePlacementId, selected, isEditable]);

	const applyWithSave = useCallback(
		(state: HandleState<any>, target: Object3D) => {
			defaultApply(state, target);

			if (state.last) {
				gl.shadowMap.needsUpdate = true;
				move({
					position: target.position,
					rotation: target.quaternion,
				});
			}
		},
		[move, gl]
	);

	const hypotenuse = Math.sqrt(halfExtents[0] * halfExtents[0] + halfExtents[2] * halfExtents[2]);

	if (!furnitureId || !placement) return null;

	return (
		<group
			ref={groupRef}
			position={[placement.position.x, placement.position.y, placement.position.z]}
			quaternion={[placement.rotation.x, placement.rotation.y, placement.rotation.z, placement.rotation.w]}
		>
			{isEditable && (
				<ConditionalHandle enabled={selected} targetRef={groupRef as any} translate={{ x: true, y: false, z: true }} scale={false} rotate={false} apply={applyWithSave}>
					<CollisionModel furnitureId={furnitureId} onClick={handleClick} />
				</ConditionalHandle>
			)}
			<FurnitureModel furnitureId={furnitureId} ref={modelRef} castShadow={size.y > 0.2} receiveShadow={size.y < 0.2} pointerEvents="none" />

			{isEditable && selected && (
				<PlaceFurnitureUI furniturePlacementId={furniturePlacementId} furnitureId={furnitureId} setFurnitureId={setFurnitureId} height={halfExtents[1] + center.y + 0.2} />
			)}
			{isEditable && selected && (
				<Handle targetRef={groupRef as any} rotate={{ x: false, y: true, z: false }} translate="as-rotate" apply={applyWithSave}>
					<RotationRing hypotenuse={hypotenuse} />
				</Handle>
			)}
		</group>
	);
}

function ConditionalHandle({ enabled, ...props }: ComponentPropsWithoutRef<typeof Handle> & { enabled: boolean }) {
	if (!enabled) return <>{props.children}</>;
	return <Handle {...props} />;
}

function RotationRing({ hypotenuse }: { hypotenuse: number }) {
	const [hovered, setHovered] = useState(false);
	return (
		<group onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)} position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]} renderOrder={-2}>
			<mesh castShadow>
				<torusGeometry args={[hypotenuse + 0.1, 0.025, 64]} />
				<meshPhongMaterial color={colors.focus.value} emissive={colors.focus.value} emissiveIntensity={0.5} />
			</mesh>
			<mesh
				// @ts-ignore - not sure why this keeps coming up when it's wrong
				pointerEvents="none"
			>
				<torusGeometry args={[hypotenuse + 0.1, 0.03, 64]} />
				<meshPhongMaterial
					color={hovered ? colors.faded.value : colors.border.value}
					side={BackSide}
					emissive={hovered ? colors.faded.value : colors.border.value}
					emissiveIntensity={0.5}
				/>
			</mesh>
		</group>
	);
}
function PlaceFurnitureUI({
	furniturePlacementId,
	furnitureId,
	setFurnitureId,
	height,
}: {
	furniturePlacementId: PrefixedId<'fp'>;
	furnitureId: PrefixedId<'f'>;
	setFurnitureId: (id: PrefixedId<'fp'>, furnitureId: PrefixedId<'f'>) => Promise<void>;
	height: number;
}) {
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
			<Root pixelSize={0.002}>
				<Container width="100%" height="100%" gap={20}>
					<Button variant="link" onClick={handlePrevious}>
						<ArrowLeft />
					</Button>
					<Button variant="destructive" onClick={handleDelete}>
						<Trash />
					</Button>
					<Button variant="link" onClick={handleNext}>
						<ArrowRight />
					</Button>
				</Container>
			</Root>
		</Billboard>
	);
}
