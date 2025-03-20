import { useShadowMapUpdate } from '@/hooks/useShadowMapUpdate';
import { useIsEditorStageMode, useSelect, useSelectedLightPlacementId } from '@/stores/editorStore';
import { useLightPlacement, useMoveLight, useSubscribeToPlacementPosition } from '@/stores/roomStore';
import { PrefixedId } from '@alef/common';
import { defaultApply, Handle, HandleState } from '@react-three/handle';
import { useHover } from '@react-three/xr';
import { useCallback, useRef } from 'react';
import { Group, Object3D, Vector3 } from 'three';
import { CeilingLightModel } from './CeilingLightModel';

export const CeilingLight = ({ id }: { id: PrefixedId<'lp'> }) => {
	const editable = useIsEditorStageMode('lighting');
	const selectedLightId = useSelectedLightPlacementId();
	const selected = selectedLightId === id && editable;
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

			if (!selected) {
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
		[move, selected, updateShadowMap]
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
		<group position={new Vector3().copy(light.position)} ref={groupRef}>
			<mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.01]} visible={hovered || selected}>
				<ringGeometry args={[0.125, 0.16, 16]} />
				<meshBasicMaterial color="white" />
			</mesh>
			<Handle targetRef={groupRef as any} translate={{ x: true, y: false, z: true }} scale={false} rotate={false} apply={applyWithSave}>
				<CeilingLightModel onClick={handleClick} renderOrder={editable ? -1 : 0} />
			</Handle>
		</group>
	);
};
