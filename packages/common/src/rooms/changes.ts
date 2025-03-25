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
			if (!state.layouts[change.roomLayoutId]) {
				throw new AlefError(AlefError.Code.NotFound, `Room layout ${change.roomLayoutId} not found`);
			}
			if (!state.layouts[change.roomLayoutId]!.furniture[change.data.id]) {
				throw new AlefError(AlefError.Code.NotFound, `Furniture ${change.data.id} not found in room layout ${change.roomLayoutId}`);
			}
			state.layouts[change.roomLayoutId]!.furniture[change.data.id] = { ...state.layouts[change.roomLayoutId]!.furniture[change.data.id]!, ...change.data };
			return state;
		case 'updateLight':
			if (!state.lights[change.data.id]) {
				throw new AlefError(AlefError.Code.NotFound, `Light ${change.data.id} not found`);
			}
			state.lights[change.data.id] = { ...state.lights[change.data.id]!, ...change.data };
			return state;
		case 'removeFurniture':
			if (!state.layouts[change.roomLayoutId]) {
				throw new AlefError(AlefError.Code.NotFound, `Room layout ${change.roomLayoutId} not found`);
			}
			delete state.layouts[change.roomLayoutId]!.furniture[change.id];
			return state;
		case 'removeLight':
			delete state.lights[change.id];
			return state;
		case 'updateGlobalLighting':
			state.globalLighting = { ...state.globalLighting, ...change.data };
			return state;
		case 'deleteLayout':
			delete state.layouts[change.roomLayoutId];
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
		default:
			return state;
	}
}

export function getUndo(baseState: RoomState, change: Operation): Operation | null {
	switch (change.type) {
		case 'addFurniture':
			return { type: 'removeFurniture', roomId: baseState.id, roomLayoutId: change.roomLayoutId, id: change.data.id };
		case 'addLight':
			return { type: 'removeLight', roomId: baseState.id, id: change.data.id };
		case 'updateFurniture':
			if (!baseState.layouts[change.roomLayoutId]) {
				return null;
			}
			if (!baseState.layouts[change.roomLayoutId]!.furniture[change.data.id]) {
				return null;
			}
			return { type: 'updateFurniture', roomId: baseState.id, roomLayoutId: change.roomLayoutId, data: baseState.layouts[change.roomLayoutId]!.furniture[change.data.id]! };
		case 'updateLight':
			if (!baseState.lights[change.data.id]) {
				return null;
			}
			return { type: 'updateLight', roomId: baseState.id, data: baseState.lights[change.data.id]! };
		case 'removeFurniture':
			if (!baseState.layouts[change.roomLayoutId]) {
				return null;
			}
			if (!baseState.layouts[change.roomLayoutId]!.furniture[change.id]) {
				return null;
			}
			return { type: 'addFurniture', roomId: baseState.id, roomLayoutId: change.roomLayoutId, data: baseState.layouts[change.roomLayoutId]!.furniture[change.id]! };
		case 'removeLight':
			if (!baseState.lights[change.id]) {
				return null;
			}
			return { type: 'addLight', roomId: baseState.id, data: baseState.lights[change.id]! };
		case 'updateGlobalLighting':
			return { type: 'updateGlobalLighting', roomId: baseState.id, data: { ...baseState.globalLighting } };
		case 'deleteLayout':
			if (!baseState.layouts[change.roomLayoutId]) {
				return null;
			}
			return { type: 'createLayout', roomId: baseState.id, data: baseState.layouts[change.roomLayoutId]! };
		default:
			return null;
	}
}
