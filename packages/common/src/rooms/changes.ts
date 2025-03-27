import { AlefError } from '../error.js';
import { mergePlanes } from '../planes.js';
import { Operation, operationShape } from './operations.js';
import { RoomState } from './state.js';

export type Updates<T extends { id: any }> = T extends { id: infer U } ? { id: U } & Partial<Omit<T, 'id'>> : T;

export function updateRoom(state: RoomState, change: Operation) {
	// validate the operation
	// this will throw if the operation is invalid.
	operationShape.parse(change);
	switch (change.type) {
		case 'updatePlanes':
			state.planes = mergePlanes(state.planes, change.planes);
			state.planesUpdatedAt = change.time;
			return state;
		case 'addFurniture':
			if (!state.layouts[change.roomLayoutId]) {
				throw new AlefError(AlefError.Code.NotFound, `Room layout ${change.roomLayoutId} not found`);
			}
			state.layouts[change.roomLayoutId]!.furniture[change.data.id] = change.data;
			return state;
		case 'addLight':
			state.lights[change.data.id] = change.data;
			return state;
		case 'updateFurniture':
			if (!state.layouts[change.layoutId]) {
				throw new AlefError(AlefError.Code.NotFound, `Room layout ${change.layoutId} not found`);
			}
			if (!state.layouts[change.layoutId]!.furniture[change.data.id]) {
				throw new AlefError(AlefError.Code.NotFound, `Furniture ${change.data.id} not found in room layout ${change.layoutId}`);
			}
			state.layouts[change.layoutId]!.furniture[change.data.id] = { ...state.layouts[change.layoutId]!.furniture[change.data.id]!, ...change.data };
			return state;
		case 'updateLight':
			if (!state.lights[change.data.id]) {
				throw new AlefError(AlefError.Code.NotFound, `Light ${change.data.id} not found`);
			}
			state.lights[change.data.id] = { ...state.lights[change.data.id]!, ...change.data };
			return state;
		case 'removeFurniture':
			if (!state.layouts[change.layoutId]) {
				throw new AlefError(AlefError.Code.NotFound, `Room layout ${change.layoutId} not found`);
			}
			delete state.layouts[change.layoutId]!.furniture[change.id];
			return state;
		case 'removeLight':
			delete state.lights[change.id];
			return state;
		case 'updateGlobalLighting':
			state.globalLighting = { ...state.globalLighting, ...change.data };
			return state;
		case 'deleteLayout':
			delete state.layouts[change.layoutId];
			return state;
		case 'createLayout':
			if (state.layouts[change.data.id]) {
				throw new AlefError(AlefError.Code.Conflict, `Room layout ${change.data.id} already exists`);
			}
			state.layouts[change.data.id] = {
				furniture: {},
				name: 'New layout',
				...change.data,
			};
			return state;
		case 'updateLayout':
			if (!state.layouts[change.data.id]) {
				throw new AlefError(AlefError.Code.NotFound, `Room layout ${change.data.id} not found`);
			}
			state.layouts[change.data.id] = { ...state.layouts[change.data.id]!, ...change.data };
			return state;

		// editor operations -- will no-op without an editor state key
		case 'selectLayout':
			if (!state.editor) return state;
			if (!state.layouts[change.layoutId]) {
				// don't fail, just noop
				return state;
			}
			state.editor.selectedLayoutId = change.layoutId;
			state.editor.selectedObjectId = null;
			return state;
		case 'selectObject':
			if (!state.editor) return state;
			state.editor.selectedObjectId = change.objectId;
			return state;
		case 'setPlacingFurniture':
			if (!state.editor) return state;
			state.editor.selectedObjectId = null;
			state.editor.placingFurnitureId = change.furnitureId;
			return state;
		case 'setEditorMode':
			if (!state.editor) return state;
			state.editor.mode = change.mode;
			return state;

		default:
			return state;
	}
}
