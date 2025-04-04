import { Operation } from '@alef/common';
import { ApiCreator } from './apiTypes';

export interface HistoryApi {
	undoStack: Operation[];
	redoStack: Operation[];
	undo(): void;
	redo(): void;
}

export const createHistoryApi: ApiCreator<HistoryApi> = (globalSet, globalGet) => {
	return {
		undoStack: [],
		redoStack: [],
		async undo() {
			const undoOp = globalGet().history.undoStack[globalGet().history.undoStack.length - 1];
			if (undoOp) {
				await globalGet().roomApis[undoOp.roomId].localChange(undoOp, { historyStack: 'redoStack', disableClearRedo: true });
				globalSet((state) => {
					state.history.undoStack.pop();
				});
			}
		},
		async redo() {
			const redoOp = globalGet().history.redoStack[globalGet().history.redoStack.length - 1];
			if (redoOp) {
				await globalGet().roomApis[redoOp.roomId].localChange(redoOp, { historyStack: 'undoStack', disableClearRedo: true });
				globalSet((state) => {
					state.history.redoStack.pop();
				});
			}
		},
	};
};
