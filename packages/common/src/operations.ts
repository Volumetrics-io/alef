import { PrefixedId } from './ids.js';
import { RoomFurniturePlacement, RoomGlobalLighting, RoomLayout, RoomLightPlacement, UnknownRoomPlaneData, Updates } from './state.js';

export interface CreateLayoutOperation {
	type: 'createLayout';
	roomId: PrefixedId<'r'>;
	data: Pick<RoomLayout, 'id' | 'name' | 'icon' | 'type'>;
}

export interface DeleteRoomLayoutOperation {
	type: 'deleteLayout';
	roomId: PrefixedId<'r'>;
	roomLayoutId: PrefixedId<'rl'>;
}

export interface UpdatePlanesOperation {
	type: 'updatePlanes';
	roomId: PrefixedId<'r'>;
	planes: UnknownRoomPlaneData[];
	time: number;
}

export interface AddFurnitureOperation {
	type: 'addFurniture';
	roomId: PrefixedId<'r'>;
	roomLayoutId: PrefixedId<'rl'>;
	data: RoomFurniturePlacement;
}

export interface UpdateFurnitureOperation {
	type: 'updateFurniture';
	roomId: PrefixedId<'r'>;
	roomLayoutId: PrefixedId<'rl'>;
	data: Updates<RoomFurniturePlacement>;
}

export interface RemoveFurnitureOperation {
	type: 'removeFurniture';
	roomId: PrefixedId<'r'>;
	roomLayoutId: PrefixedId<'rl'>;
	id: RoomFurniturePlacement['id'];
}

export interface AddLightOperation {
	type: 'addLight';
	roomId: PrefixedId<'r'>;
	data: RoomLightPlacement;
}

export interface UpdateLightOperation {
	type: 'updateLight';
	roomId: PrefixedId<'r'>;
	data: Updates<RoomLightPlacement>;
}

export interface RemoveLightOperation {
	type: 'removeLight';
	roomId: PrefixedId<'r'>;
	id: RoomLightPlacement['id'];
}

export interface UpdateGlobalLightingOperation {
	type: 'updateGlobalLighting';
	roomId: PrefixedId<'r'>;
	data: Partial<RoomGlobalLighting>;
}

export interface UpdateRoomLayoutOperation {
	type: 'updateLayout';
	roomId: PrefixedId<'r'>;
	// only some properties are editable with this message.
	data: Pick<RoomLayout, 'id' | 'name' | 'icon' | 'type'>;
}

export type Operation =
	| AddFurnitureOperation
	| AddLightOperation
	| CreateLayoutOperation
	| DeleteRoomLayoutOperation
	| RemoveFurnitureOperation
	| RemoveLightOperation
	| UpdateFurnitureOperation
	| UpdateGlobalLightingOperation
	| UpdateLightOperation
	| UpdateRoomLayoutOperation
	| UpdatePlanesOperation;
