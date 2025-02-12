import { useSelect, useSelectedLightPlacementId } from '@/stores/editorStore';
import { useGlobalLighting, useLightPlacement, useMoveLight, useSubscribeToPlacementPosition } from '@/stores/roomStore/roomStore';
import { useStageStore } from '@/stores/stageStore';
import { PrefixedId } from '@alef/common';
import { Handle, HandleTarget } from '@react-three/handle';
import { useHover } from '@react-three/xr';
import { useCallback, useRef } from 'react';
import { Group, Vector3 } from 'three';
import { getLightColor } from './getLightColor';

export const CeilingLight = ({ id, ...props }: { id: PrefixedId<'lp'> }) => {
	const { mode } = useStageStore();
	const editable = mode === 'lighting';
	const selectedLightId = useSelectedLightPlacementId();
	const selected = selectedLightId === id;
	const select = useSelect();
	const [{ intensity: globalIntensity, color: globalColor }] = useGlobalLighting();

	const groupRef = useRef<Group>(null);
	const hovered = useHover(groupRef as any);

	const handleClick = () => {
		if (!editable) return;
		select(id);
	};

	const light = useLightPlacement(id);
	const move = useMoveLight(id);

	const handlePointerUp = useCallback(() => {
		if (!groupRef.current) return;

		move({ position: groupRef.current.position });
	}, [move]);

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
		<HandleTarget>
			<group position={new Vector3().copy(light.position)} ref={groupRef}>
				{editable && (
					<group>
						<mesh position={[0, -0.01, 0]} visible={hovered || selected} rotation={[Math.PI / 2, 0, 0]}>
							<ringGeometry args={[0.125, 0.16, 32]} />
							<meshBasicMaterial color="white" />
						</mesh>
						<Handle targetRef="from-context" translate={{ x: true, y: false, z: true }} scale={false} rotate={false}>
							<mesh onClick={handleClick} onPointerUp={handlePointerUp}>
								<sphereGeometry args={[0.1, 32, 32]} />
								<meshBasicMaterial color={getLightColor(globalColor)} transparent={true} opacity={globalIntensity} />
							</mesh>
						</Handle>
					</group>
				)}
				<spotLight
					castShadow={true}
					shadow-mapSize-width={2048}
					shadow-mapSize-height={2048}
					shadow-camera-far={10}
					shadow-bias={0.000008}
					shadow-normalBias={0.013}
					angle={Math.PI / 2.5} // 60 degrees spread
					penumbra={0.2} // Soft edges
					decay={0.5} // Physical light falloff
					distance={20} // Maximum range
					position={[0, 0, 0]}
					intensity={globalIntensity} // Compensate for directional nature
					color={getLightColor(globalColor)}
					{...props}
				/>
			</group>
		</HandleTarget>
	);
};
