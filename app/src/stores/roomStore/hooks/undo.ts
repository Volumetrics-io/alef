import { useRoomStore } from '../roomStore';

export function useUndo() {
	const canUndo = useRoomStore((s) => s.undoStack.length > 0);
	const canRedo = useRoomStore((s) => s.redoStack.length > 0);
	const undo = useRoomStore((s) => s.undo);
	const redo = useRoomStore((s) => s.redo);

	return {
		canUndo,
		canRedo,
		undo,
		redo,
	};
}
