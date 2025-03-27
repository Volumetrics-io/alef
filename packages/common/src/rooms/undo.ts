import { Operation, createOp } from './operations.js';
import { RoomState } from './state.js';

export function getUndo(baseState: RoomState, change: Operation): Operation | null {
	switch (change.type) {
		case 'addFurniture':
			return createOp({ type: 'removeFurniture', roomId: baseState.id, layoutId: change.roomLayoutId, id: change.data.id });
		case 'addLight':
			return createOp({ type: 'removeLight', roomId: baseState.id, id: change.data.id });
		case 'updateFurniture':
			if (!baseState.layouts[change.layoutId]) {
				return null;
			}
			if (!baseState.layouts[change.layoutId]!.furniture[change.data.id]) {
				return null;
			}
			return createOp({
				type: 'updateFurniture',
				roomId: baseState.id,
				layoutId: change.layoutId,
				data: baseState.layouts[change.layoutId]!.furniture[change.data.id]!,
			});
		case 'updateLight':
			if (!baseState.lights[change.data.id]) {
				return null;
			}
			return createOp({ type: 'updateLight', roomId: baseState.id, data: baseState.lights[change.data.id]! });
		case 'removeFurniture':
			if (!baseState.layouts[change.layoutId]) {
				return null;
			}
			if (!baseState.layouts[change.layoutId]!.furniture[change.id]) {
				return null;
			}
			return createOp({
				type: 'addFurniture',
				roomId: baseState.id,
				roomLayoutId: change.layoutId,
				data: baseState.layouts[change.layoutId]!.furniture[change.id]!,
			});
		case 'removeLight':
			if (!baseState.lights[change.id]) {
				return null;
			}
			return createOp({ type: 'addLight', roomId: baseState.id, data: baseState.lights[change.id]! });
		case 'updateGlobalLighting':
			return createOp({ type: 'updateGlobalLighting', roomId: baseState.id, data: { ...baseState.globalLighting } });
		case 'deleteLayout':
			if (!baseState.layouts[change.layoutId]) {
				return null;
			}
			return createOp({ type: 'createLayout', roomId: baseState.id, data: baseState.layouts[change.layoutId]! });
		default:
			// this covers all editor operations, too. selection changes are not undoable.
			return null;
	}
}
