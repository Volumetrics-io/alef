import { usePropertyStore } from '../propertyStore';

export function useUndo() {
	const canUndo = usePropertyStore((s) => s.history.undoStack.length > 0);
	const canRedo = usePropertyStore((s) => s.history.redoStack.length > 0);
	const undo = usePropertyStore((s) => s.history.undo);
	const redo = usePropertyStore((s) => s.history.redo);

	return {
		canUndo,
		canRedo,
		undo,
		redo,
	};
}
