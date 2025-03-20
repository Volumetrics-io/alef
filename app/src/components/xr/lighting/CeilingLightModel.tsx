import { useGlobalLighting } from '@/stores/roomStore';
import { MeshProps } from '@react-three/fiber';
import { getLightColor } from './getLightColor';

export interface CeilingLightModelProps extends MeshProps {}

export function CeilingLightModel(props: CeilingLightModelProps) {
	const [{ intensity: globalIntensity, color: globalColor }] = useGlobalLighting();
	return (
		<group>
			<mesh {...props}>
				<sphereGeometry args={[0.1, 8, 8]} />
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
