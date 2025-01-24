import { useLightStore } from '@/stores/lightStore';
import { useStageStore } from '@/stores/stageStore';
import { Handle, HandleOptions, HandleTarget } from '@react-three/handle';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Group, Vector3 } from 'three';
import { getLightColor } from './getLightColor';

export const CeilingLight = ({ id, ...props }: { id: string }) => {
	const { selectedLightId, setSelectedLightId, hoveredLightId, setHoveredLightId, setLightPosition } = useLightStore();
	const { mode } = useStageStore();
	const editable = mode === 'lighting';
	const selected = selectedLightId === id;
	const hovered = hoveredLightId === id;
	const globalIntensity = useLightStore((s) => s.globalIntensity);
	const globalColor = useLightStore((s) => s.globalColor);

	const groupRef = useRef<Group>(null);

	const handleClick = () => {
		if (!editable) return;
		setSelectedLightId(id);
	};

	const handleHover = useCallback(() => {
		if (!editable) return;
		setHoveredLightId(id);
	}, [editable, setHoveredLightId, id]);

	const handleHoverLeave = useCallback(() => {
		if (!editable) return;
		setHoveredLightId(null);
	}, [editable, setHoveredLightId]);

	const initialPosition = useLightStore((s) => s.lightDetails[id].position);

	const handlePointerUp = useCallback(() => {
		if (!groupRef.current) return;

		setLightPosition(id, groupRef.current.position);
	}, [setLightPosition, id]);

	// subscribe to position changes
	useEffect(() => {
		return useLightStore.subscribe(
			(s) => s.lightDetails[id].position,
			(position) => {
				if (position) {
					groupRef.current?.position.copy(position);
				}
			}
		);
	});

	return (
		<HandleTarget targetRef={groupRef}>
			<group position={initialPosition} ref={groupRef}>
				{editable && (
					<group>
						<mesh position={[0, -0.01, 0]} visible={hovered || selected} rotation={[Math.PI / 2, 0, 0]}>
							<ringGeometry args={[0.125, 0.16, 32]} />
							<meshBasicMaterial color="white" />
						</mesh>
						<Handle useTargetFromContext translate={{ x: true, y: false, z: true }} scale={false} rotate={false}>
							<mesh onClick={handleClick} onPointerOver={handleHover} onPointerUp={handlePointerUp} onPointerOut={handleHoverLeave}>
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
