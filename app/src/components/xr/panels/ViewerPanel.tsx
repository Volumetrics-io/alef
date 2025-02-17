import { Root } from '@react-three/uikit';
import { DraggableBodyAnchor } from '../anchors/DraggableBodyAnchor';
import { Layouts } from './staging/Layouts';

export function ViewerPanel() {
	return (
		<DraggableBodyAnchor follow position={[0, -0.1, 0.8]} lockY distance={0.15}>
			<Root pixelSize={0.001} flexDirection="column" gap={10}>
				<Layouts readonly />
			</Root>
		</DraggableBodyAnchor>
	);
}
