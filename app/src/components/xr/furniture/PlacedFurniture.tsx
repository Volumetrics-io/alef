import { useAABB } from '@/hooks/useAABB';
import { useShadowMapUpdate } from '@/hooks/useShadowMapUpdate';
import { useIsEditorStageMode, useIsSelected, useSelect, useSetPanelState } from '@/stores/editorStore';
import { useFurniturePlacement, useFurniturePlacementFurnitureId, useUpdateFurniturePlacementTransform } from '@/stores/roomStore';
import { PrefixedId } from '@alef/common';
import { ErrorBoundary } from '@alef/sys';
import { Bvh } from '@react-three/drei';
import { defaultApply, Handle, HandleState } from '@react-three/handle';
import { ComponentPropsWithoutRef, startTransition, useCallback, useRef, useState } from 'react';
import { BackSide, Group, Object3D } from 'three';
import { colors } from '../ui/theme';
import { CollisionModel, FurnitureModel, MissingModel } from './FurnitureModel';

export interface PlacedFurnitureProps {
	furniturePlacementId: PrefixedId<'fp'>;
}

export function PlacedFurniture({ furniturePlacementId }: PlacedFurnitureProps) {
	const furnitureId = useFurniturePlacementFurnitureId(furniturePlacementId);
	const placement = useFurniturePlacement(furniturePlacementId);
	const select = useSelect();
	const selected = useIsSelected(furniturePlacementId);
	const mode = useIsEditorStageMode('furniture');
	const setPanelState = useSetPanelState();
	const updateShadowMap = useShadowMapUpdate();

	const groupRef = useRef<Group>(null);
	const move = useUpdateFurniturePlacementTransform(furniturePlacementId);

	const { halfExtents, size, ref: modelRef, ready } = useAABB();
	const isEditable = ready && mode;

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
						{/* @ts-expect-error - pointerEventsType not included in typings */}
						<CollisionModel pointerEventsType={{ deny: 'touch' }} furnitureId={furnitureId} onClick={handleClick} />
					</ConditionalHandle>
				)}

				{selected && <RotationHandle targetRef={groupRef as any} apply={applyWithSave} radius={hypotenuse + 0.075} position={[0, 0.5, 0]} />}
				<FurnitureModel key={furnitureId} furnitureId={furnitureId} ref={modelRef} castShadow={size.y > 0.2} receiveShadow={mode} pointerEvents="none" />
			</group>
		</ErrorBoundary>
	);
}

function ConditionalHandle({ enabled, ...props }: ComponentPropsWithoutRef<typeof Handle> & { enabled: boolean }) {
	if (!enabled) return <>{props.children}</>;
	return <Handle {...props} />;
}

function RotationHandle({ radius, position, ...props }: ComponentPropsWithoutRef<typeof Handle> & { radius: number; position: [number, number, number] }) {
	const [hovered, setHovered] = useState(false);
	return (
		<Handle rotate={{ x: false, y: true, z: false }} translate="as-rotate" {...props}>
			<Bvh onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)} position={position} rotation={[Math.PI / 2, 0, 0]} renderOrder={-2}>
				<mesh>
					<torusGeometry args={[radius, 0.025, 32]} />
					<meshPhongMaterial color={colors.focus.value} emissive={colors.focus.value} emissiveIntensity={0.5} />
				</mesh>
				<mesh
					// @ts-expect-error - pointerEvents not included in typings
					pointerEvents="none"
				>
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
