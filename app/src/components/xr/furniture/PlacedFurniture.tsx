import { useAABB } from '@/hooks/useAABB';
import { useShadowControls } from '@/hooks/useShadowMapUpdate';
import { useSetPanelState } from '@/stores/editorStore';
import { useFurniturePlacement, useFurniturePlacementFurnitureId, useSubscribeToPlacementPosition, useUpdateFurniturePlacementTransform } from '@/stores/roomStore';
import { useIsEditorMode, useIsSelected, useSelect } from '@/stores/roomStore/hooks/editing';
import { PrefixedId } from '@alef/common';
import { ErrorBoundary } from '@alef/sys';
import { Bvh } from '@react-three/drei';
import { defaultApply, Handle, HandleState } from '@react-three/handle';
import { ComponentPropsWithoutRef, startTransition, useCallback, useRef, useState } from 'react';
import { BackSide, Group, Object3D } from 'three';
import { colors } from '../ui/theme';
import { FurnitureModel, MissingModel, SimpleCollisionModel } from './FurnitureModel';

export interface PlacedFurnitureProps {
	furniturePlacementId: PrefixedId<'fp'>;
}

export function PlacedFurniture({ furniturePlacementId }: PlacedFurnitureProps) {
	const furnitureId = useFurniturePlacementFurnitureId(furniturePlacementId);
	const placement = useFurniturePlacement(furniturePlacementId);
	const select = useSelect();
	const selected = useIsSelected(furniturePlacementId);
	const isFurnitureMode = useIsEditorMode('furniture');
	const setPanelState = useSetPanelState();
	const shadowControls = useShadowControls();

	const groupRef = useRef<Group>(null);
	const move = useUpdateFurniturePlacementTransform(furniturePlacementId);
	// update for remote position changes
	useSubscribeToPlacementPosition(furniturePlacementId, (position) => {
		if (position) {
			groupRef.current?.position.copy(position);
		}
	});

	const { halfExtents, size, ref: modelRef } = useAABB();

	const handleClick = useCallback(() => {
		startTransition(() => {
			select(furniturePlacementId);
			setPanelState('hidden');
		});
	}, [select, furniturePlacementId]);

	const applyWithSave = useCallback(
		(state: HandleState<any>, target: Object3D) => {
			if (!(state && target)) {
				// not sure how or why, but this has occurred.
				return;
			}
			if (!selected) {
				// do not apply handle changes if this item is not selected.
				return;
			}

			if (state.first) {
				// disable shadows while moving
				shadowControls.disable();
			}

			defaultApply(state, target);

			if (state.last) {
				shadowControls.enable();
				move({
					position: target.position,
					rotation: target.quaternion,
				});
			}
		},
		[move, selected, shadowControls]
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
				<Handle targetRef={groupRef as any} translate={{ x: true, y: false, z: true }} scale={false} rotate={false} apply={applyWithSave}>
					<SimpleCollisionModel pointerEventsType={{ deny: 'touch' }} furnitureId={furnitureId} onClick={handleClick} enabled={isFurnitureMode} />
				</Handle>

				<RotationHandle targetRef={groupRef as any} apply={applyWithSave} radius={hypotenuse + 0.075} position={[0, 0.5, 0]} visible={selected} />
				<FurnitureModel key={furnitureId} furnitureId={furnitureId} ref={modelRef} castShadow={size.y > 0.2} receiveShadow={isFurnitureMode} pointerEvents="none" />
			</group>
		</ErrorBoundary>
	);
}

function RotationHandle({
	radius,
	position,
	visible,
	...props
}: ComponentPropsWithoutRef<typeof Handle> & { radius: number; position: [number, number, number]; visible?: boolean }) {
	const [hovered, setHovered] = useState(false);
	return (
		<Handle rotate={{ x: false, y: true, z: false }} translate="as-rotate" {...props}>
			<Bvh
				pointerEvents={visible ? 'auto' : 'none'}
				onPointerEnter={() => setHovered(true)}
				onPointerLeave={() => setHovered(false)}
				position={position}
				rotation={[Math.PI / 2, 0, 0]}
				renderOrder={-2}
				enabled={visible}
			>
				<mesh visible={visible}>
					<torusGeometry args={[radius, 0.025, 32]} />
					<meshPhongMaterial color={colors.focus.value} emissive={colors.focus.value} emissiveIntensity={0.5} />
				</mesh>
				<mesh visible={visible} pointerEvents="none">
					<torusGeometry args={[radius, 0.03, 32]} />
					<meshPhongMaterial
						color={hovered ? colors.faded.value : colors.border.value}
						side={BackSide}
						emissive={hovered ? colors.faded.value : colors.border.value}
						emissiveIntensity={0.5}
					/>
				</mesh>
			</Bvh>
		</Handle>
	);
}
