import { useShadowMapUpdate } from '@/hooks/useShadowMapUpdate';
import { useLightPlacement, useMoveLight, useSubscribeToPlacementPosition } from '@/stores/propertyStore';
import { useIsEditorMode, useIsSelected, useSelect } from '@/stores/propertyStore/hooks/editing';
import { PrefixedId } from '@alef/common';
import { defaultApply, Handle, HandleState } from '@react-three/handle';
import { useHover } from '@react-three/xr';
import { useCallback, useRef } from 'react';
import { Group, Object3D, Vector3 } from 'three';
import { CeilingLightModel } from './CeilingLightModel';

export const CeilingLight = ({ id }: { id: PrefixedId<'lp'> }) => {
	const editable = useIsEditorMode('lighting');
	const selected = useIsSelected(id) && editable;
	const select = useSelect();
	const updateShadowMap = useShadowMapUpdate();

	const groupRef = useRef<Group>(null);
	const hovered = useHover(groupRef as any);
	const move = useMoveLight(id);

	const applyWithSave = useCallback(
		(state: HandleState<any>, target: Object3D) => {
			if (!(state && target)) {
				return;
			}

			if (!editable) {
				return;
			}

			defaultApply(state, target);

			if (state.last) {
				updateShadowMap();
				move({
					position: target.position,
				});
			}
		},
		[move, editable, updateShadowMap]
	);

	const handleClick = () => {
		if (!editable) return;
		select(id);
	};

	const light = useLightPlacement(id);

	// subscribe to position changes
	useSubscribeToPlacementPosition(id, (position) => {
		if (position) {
			groupRef.current?.position.copy(position);
		}
	});

	if (!light) {
		return null;
	}

	return (
		<group
			position={new Vector3().copy(light.position)}
			// @ts-ignore
			pointerEvents={editable ? 'auto' : 'none'}
			ref={groupRef}
		>
			<mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.01]} visible={editable && (hovered || selected)}>
				<ringGeometry args={[0.125, 0.16, 16]} />
				<meshBasicMaterial color="white" side={2} />
			</mesh>
			<Handle targetRef={groupRef as any} translate={{ x: true, y: false, z: true }} scale={false} rotate={false} apply={applyWithSave}>
				<CeilingLightModel onClick={handleClick} renderOrder={editable ? -1 : 0} />
			</Handle>
		</group>
	);
};
