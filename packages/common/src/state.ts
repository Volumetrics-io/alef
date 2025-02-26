import { RoomType } from './attributes';
import { AlefError } from './error';
import { PrefixedId } from './ids';
import { Operation } from './operations';

export interface SimpleVector3 {
	x: number;
	y: number;
	z: number;
}
export interface SimpleQuaternion {
	x: number;
	y: number;
	z: number;
	w: number;
}

export interface RoomState {
	id: PrefixedId<'r'>;
	walls: RoomWallData[];
	layouts: Record<PrefixedId<'rl'>, RoomLayout>;
	lights: Record<PrefixedId<'lp'>, RoomLightPlacement>;
	globalLighting: RoomGlobalLighting;
}

export interface RoomLayout {
	id: PrefixedId<'rl'>;
	furniture: Record<PrefixedId<'fp'>, RoomFurniturePlacement>;
	/** An icon override. Kind of legacy. */
	icon?: string;
	name?: string;
	/** A specified type for this room layout, if specified */
	type?: RoomType;
}

export interface RoomWallData {
	origin: SimpleVector3;
	normal: SimpleVector3;
	extents: [number, number];
}

export interface RoomFurniturePlacement {
	id: PrefixedId<'fp'>;
	position: SimpleVector3;
	rotation: SimpleQuaternion;
	furnitureId: PrefixedId<'f'>;
}

export interface RoomLightPlacement {
	id: PrefixedId<'lp'>;
	position: SimpleVector3;
}

export interface RoomGlobalLighting {
	color: number;
	intensity: number;
}

export type Updates<T extends { id: any }> = T extends { id: infer U } ? { id: U } & Partial<Omit<T, 'id'>> : T;

export function updateRoom(state: RoomState, change: Operation) {
	switch (change.type) {
		case 'updateWalls':
			state.walls = change.walls;
			return state;
		case 'addFurniture':
			if (!state.layouts[change.roomLayoutId]) {
				throw new AlefError(AlefError.Code.NotFound, `Room layout ${change.roomLayoutId} not found`);
			}
			state.layouts[change.roomLayoutId].furniture[change.data.id] = change.data;
			return state;
		case 'addLight':
			state.lights[change.data.id] = change.data;
			return state;
		case 'updateFurniture':
			if (!state.layouts[change.roomLayoutId]) {
				throw new AlefError(AlefError.Code.NotFound, `Room layout ${change.roomLayoutId} not found`);
			}
			if (!state.layouts[change.roomLayoutId].furniture[change.data.id]) {
				throw new AlefError(AlefError.Code.NotFound, `Furniture ${change.data.id} not found in room layout ${change.roomLayoutId}`);
			}
			state.layouts[change.roomLayoutId].furniture[change.data.id] = { ...state.layouts[change.roomLayoutId].furniture[change.data.id], ...change.data };
			return state;
		case 'updateLight':
			if (!state.lights[change.data.id]) {
				throw new AlefError(AlefError.Code.NotFound, `Light ${change.data.id} not found`);
			}
			state.lights[change.data.id] = { ...state.lights[change.data.id], ...change.data };
			return state;
		case 'removeFurniture':
			if (!state.layouts[change.roomLayoutId]) {
				throw new AlefError(AlefError.Code.NotFound, `Room layout ${change.roomLayoutId} not found`);
			}
			delete state.layouts[change.roomLayoutId].furniture[change.id];
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
			return { type: 'updateFurniture', roomId: baseState.id, roomLayoutId: change.roomLayoutId, data: baseState.layouts[change.roomLayoutId]?.furniture[change.data.id] };
		case 'updateLight':
			return { type: 'updateLight', roomId: baseState.id, data: baseState.lights[change.data.id] };
		case 'removeFurniture':
			if (!baseState.layouts[change.roomLayoutId]) {
				return null;
			}
			return { type: 'addFurniture', roomId: baseState.id, roomLayoutId: change.roomLayoutId, data: baseState.layouts[change.roomLayoutId]?.furniture[change.id] };
		case 'removeLight':
			return { type: 'addLight', roomId: baseState.id, data: baseState.lights[change.id] };
		case 'updateGlobalLighting':
			return { type: 'updateGlobalLighting', roomId: baseState.id, data: { ...baseState.globalLighting } };
		case 'deleteLayout':
			return { type: 'createLayout', roomId: baseState.id, data: baseState.layouts[change.roomLayoutId] };
		default:
			return null;
	}
}
