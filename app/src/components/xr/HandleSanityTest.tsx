import { Sphere } from '@react-three/drei';
import { Handle } from '@react-three/handle';

export function HandleSanityTest() {
	return (
		<Handle rotate={false} scale={false}>
			<Sphere>
				<meshBasicMaterial color="red" />
			</Sphere>
		</Handle>
	);
}
