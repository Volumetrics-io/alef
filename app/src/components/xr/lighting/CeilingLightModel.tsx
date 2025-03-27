import { useGlobalLighting } from '@/stores/roomStore';
import { useIsEditorMode } from '@/stores/roomStore/hooks/editing';
import { MeshProps } from '@react-three/fiber';
import { useXR } from '@react-three/xr';
import { getLightColor } from './getLightColor';

export interface CeilingLightModelProps extends MeshProps {}

export function CeilingLightModel(props: CeilingLightModelProps) {
	const [{ intensity: globalIntensity, color: globalColor }] = useGlobalLighting();
	const enabled = useIsEditorMode('lighting');
	const { session } = useXR();

	const visible = session === null || enabled;

	return (
		<group>
			<mesh {...props} visible={visible}>
				<sphereGeometry args={[0.1, 16, 16]} />
				<meshBasicMaterial color={getLightColor(globalColor)} transparent={true} opacity={globalIntensity} />
			</mesh>
			<spotLight
				position={[0, 0.1, 0]} // Position the light slightly above the ceiling
				angle={Math.PI / 2.5} // 60 degrees spread
				penumbra={0.2} // Soft edges
				decay={0.5} // Physical light falloff
				distance={20} // Maximum range
				intensity={globalIntensity} // Compensate for directional nature
				color={getLightColor(globalColor)}
			/>
		</group>
	);
}
