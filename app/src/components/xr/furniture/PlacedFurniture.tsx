import { useAABB } from '@/hooks/useAABB';
import { useEditorStore } from '@/stores/editorStore';
import {
	useDeleteFurniturePlacement,
	useFurniturePlacement,
	useFurniturePlacementFurnitureId,
	useFurnitureQuickSwap,
	useUpdateFurniturePlacementTransform,
} from '@/stores/roomStore';
import { PrefixedId, RoomFurniturePlacement } from '@alef/common';
import { ErrorBoundary } from '@alef/sys';
import { defaultApply, Handle, HandleState } from '@react-three/handle';
import { Container, Root } from '@react-three/uikit';
import { ArrowLeft, ArrowRight, Trash } from '@react-three/uikit-lucide';
import { ComponentPropsWithoutRef, startTransition, useCallback, useRef, useState } from 'react';
import { BackSide, Group, Object3D } from 'three';
import { Billboard } from '../Billboard';
import { Button } from '../ui/Button';
import { colors } from '../ui/theme';
import { CollisionModel, FurnitureModel, MissingModel } from './FurnitureModel';
import { useShadowMapUpdate } from '@/hooks/useShadowMapUpdate';
export interface PlacedFurnitureProps {
	furniturePlacementId: PrefixedId<'fp'>;
}

export function PlacedFurniture({ furniturePlacementId }: PlacedFurnitureProps) {
	const furnitureId = useFurniturePlacementFurnitureId(furniturePlacementId);
	const placement = useFurniturePlacement(furniturePlacementId);
	const select = useEditorStore((s) => s.select);
	const selected = useEditorStore((s) => s.selectedId === furniturePlacementId);
	const mode = useEditorStore((s) => s.mode);

	const updateShadowMap = useShadowMapUpdate();

	const groupRef = useRef<Group>(null);
	const move = useUpdateFurniturePlacementTransform(furniturePlacementId);

	const { halfExtents, size, center, ref: modelRef, ready } = useAABB();
	const isEditable = ready && mode === 'furniture';

	const handleClick = useCallback(() => {
		if (selected) return;
		if (!isEditable) return;
		startTransition(() => {
			select(furniturePlacementId);
		});
	}, [select, furniturePlacementId, selected, isEditable]);

	const applyWithSave = useCallback(
		(state: HandleState<any>, target: Object3D) => {
			if (!(state && target)) {
				// not sure how or why, but this has occurred.
				return;
			}
			defaultApply(state, target);

			if (state.last) {
				updateShadowMap();
				move({
					position: target.position,
					rotation: target.quaternion,
				});
			}
		},
		[move]
	);

	const hypotenuse = Math.sqrt(halfExtents[0] * halfExtents[0] + halfExtents[2] * halfExtents[2]);

	if (!furnitureId || !placement) return null;

	return (
		<ErrorBoundary fallback={<MissingModel />}>
			<group
				ref={groupRef}
				position={[placement.position.x, placement.position.y, placement.position.z]}
				quaternion={[placement.rotation.x, placement.rotation.y, placement.rotation.z, placement.rotation.w]}
			>
				{isEditable && (
					<ConditionalHandle enabled={selected} targetRef={groupRef as any} translate={{ x: true, y: false, z: true }} scale={false} rotate={false} apply={applyWithSave}>
						{/* @ts-ignore */}
						<CollisionModel pointerEventsType={{ deny: 'touch' }} furnitureId={furnitureId} onClick={handleClick} />
					</ConditionalHandle>
				)}
				<FurnitureModel key={furnitureId} furnitureId={furnitureId} ref={modelRef} castShadow={size.y > 0.2} receiveShadow={mode !== 'furniture'} pointerEvents="none" />

				{isEditable && selected && <PlacedFurnitureUI placement={placement} height={halfExtents[1] + center.y + 0.2} />}
				{isEditable && selected && (
					<Handle targetRef={groupRef as any} rotate={{ x: false, y: true, z: false }} translate="as-rotate" apply={applyWithSave}>
						{/* @ts-ignore */}
						<RotationRing pointerEventsType={{ deny: 'touch' }} radius={hypotenuse + 0.075} position={[0, 0.5, 0]} />
					</Handle>
				)}
			</group>
		</ErrorBoundary>
	);
}

function ConditionalHandle({ enabled, ...props }: ComponentPropsWithoutRef<typeof Handle> & { enabled: boolean }) {
	if (!enabled) return <>{props.children}</>;
	return <Handle {...props} />;
}

function RotationRing({ radius, position }: { radius: number; position: [number, number, number] }) {
	const [hovered, setHovered] = useState(false);
	return (
		<group onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)} position={position} rotation={[Math.PI / 2, 0, 0]} renderOrder={-2}>
			<mesh>
				<torusGeometry args={[radius, 0.025, 64]} />
				<meshPhongMaterial color={colors.focus.value} emissive={colors.focus.value} emissiveIntensity={0.5} />
			</mesh>
			<mesh
				// @ts-ignore - not sure why this keeps coming up when it's wrong
				pointerEvents="none"
			>
				<torusGeometry args={[radius, 0.03, 64]} />
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
function PlacedFurnitureUI({ placement, height }: { placement: RoomFurniturePlacement; height: number }) {
	const handleDelete = useDeleteFurniturePlacement(placement.id);
	const { swapPrevious, swapNext } = useFurnitureQuickSwap(placement);

	return (
		<Billboard lockX lockZ position={[0, height, 0]}>
			<Root pixelSize={0.002}>
				<Container width="100%" height="100%" gap={20}>
					<Button variant="link" onClick={swapPrevious}>
						<ArrowLeft />
					</Button>
					<Button variant="destructive" onClick={handleDelete}>
						<Trash />
					</Button>
					<Button variant="link" onClick={swapNext}>
						<ArrowRight />
					</Button>
				</Container>
			</Root>
		</Billboard>
	);
}
