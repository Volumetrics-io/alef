import { Root } from '@react-three/uikit';
import { DraggableBodyAnchor } from '../anchors/DraggableBodyAnchor';
import { Defaults } from '../ui/Defaults';
import { Layouts } from './staging/Layouts';
import { UpdatePrompt } from './UpdatePrompt';

export function ViewerPanel() {
	return (
		<DraggableBodyAnchor follow position={[0, -0.1, 0.8]} lockY distance={0.15}>
			<Root pixelSize={0.001} flexDirection="column" gap={10}>
				<Defaults>
					<UpdatePrompt />
					<Layouts readonly />
				</Defaults>
			</Root>
		</DraggableBodyAnchor>
	);
}
