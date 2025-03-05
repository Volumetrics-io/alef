import { Button } from '@/components/xr/ui/Button.js';
import { Surface } from '@/components/xr/ui/Surface';
import { useUndo } from '@/stores/roomStore';
import { ContainerProperties } from '@react-three/uikit';
import { RedoIcon, UndoIcon } from '@react-three/uikit-lucide';

export interface UndoControlsProps extends ContainerProperties {}

export function UndoControls(props: UndoControlsProps) {
	const { canUndo, canRedo, undo, redo } = useUndo();

	if (!canUndo && !canRedo) {
		return null;
	}

	return (
		<Surface {...props} padding={0} borderRadius={6}>
			<Button variant="ghost" size="icon" disabled={!canUndo} onClick={undo}>
				<UndoIcon />
			</Button>
			<Button variant="ghost" size="icon" disabled={!canRedo} onClick={redo}>
				<RedoIcon />
			</Button>
		</Surface>
	);
}
