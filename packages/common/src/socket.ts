import { AlefErrorCode } from './error';
import { PrefixedId } from './ids';
import { RoomFurniturePlacement, RoomGlobalLighting, RoomLayout, RoomLightPlacement, RoomState, RoomWallData, Updates } from './state';

export interface BaseServerMessage {
	/**
	 * A message ID for any message sent from the client that this
	 * message serves as a response to.
	 */
	responseTo?: string;
}

/**
 * Just a read receipt.
 */
export interface ServerAckMessage extends BaseServerMessage {
	type: 'ack';
}

export interface ServerErrorMessage extends BaseServerMessage {
	type: 'error';
	message: string;
	code: AlefErrorCode;
}

export interface ServerRoomUpdateMessage extends BaseServerMessage {
	type: 'roomUpdate';
	data: RoomState;
}

export interface ServerLayoutCreatedMessage extends BaseServerMessage {
	type: 'layoutCreated';
	data: RoomLayout;
}

export type ServerMessage = ServerAckMessage | ServerErrorMessage | ServerRoomUpdateMessage | ServerLayoutCreatedMessage;

export type ServerMessageType = ServerMessage['type'];
export type ServerMessageByType<T extends ServerMessageType> = Extract<ServerMessage, { type: T }>;

export interface BaseClientMessage {
	/**
	 * A message ID for this message.
	 */
	messageId: string;
}

export interface ClientPingMessage extends BaseClientMessage {
	type: 'ping';
}

export interface ClientRequestRoomMessage extends BaseClientMessage {
	type: 'requestRoom';
	roomId: PrefixedId<'r'>;
}

export interface ClientCreateLayoutMessage extends BaseClientMessage {
	type: 'createLayout';
	roomId: PrefixedId<'r'>;
}

export interface ClientUpdateWallsMessage extends BaseClientMessage {
	type: 'updateWalls';
	roomId: PrefixedId<'r'>;
	walls: RoomWallData[];
}

export interface ClientAddFurnitureMessage extends BaseClientMessage {
	type: 'addFurniture';
	roomId: PrefixedId<'r'>;
	roomLayoutId: PrefixedId<'rl'>;
	data: RoomFurniturePlacement;
}

export interface ClientUpdateFurnitureMessage extends BaseClientMessage {
	type: 'updateFurniture';
	roomId: PrefixedId<'r'>;
	roomLayoutId: PrefixedId<'rl'>;
	data: Updates<RoomFurniturePlacement>;
}

export interface ClientRemoveFurnitureMessage extends BaseClientMessage {
	type: 'removeFurniture';
	roomId: PrefixedId<'r'>;
	roomLayoutId: PrefixedId<'rl'>;
	id: RoomFurniturePlacement['id'];
}

export interface ClientAddLightMessage extends BaseClientMessage {
	type: 'addLight';
	roomId: PrefixedId<'r'>;
	roomLayoutId: PrefixedId<'rl'>;
	data: RoomLightPlacement;
}

export interface ClientUpdateLightMessage extends BaseClientMessage {
	type: 'updateLight';
	roomId: PrefixedId<'r'>;
	roomLayoutId: PrefixedId<'rl'>;
	data: Updates<RoomLightPlacement>;
}

export interface ClientRemoveLightMessage extends BaseClientMessage {
	type: 'removeLight';
	roomId: PrefixedId<'r'>;
	roomLayoutId: PrefixedId<'rl'>;
	id: RoomLightPlacement['id'];
}

export interface ClientUpdateGlobalLightingMessage extends BaseClientMessage {
	type: 'updateGlobalLighting';
	roomId: PrefixedId<'r'>;
	data: Partial<RoomGlobalLighting>;
}

export type ClientMessage =
	| ClientPingMessage
	| ClientCreateLayoutMessage
	| ClientRequestRoomMessage
	| ClientUpdateWallsMessage
	| ClientAddFurnitureMessage
	| ClientUpdateFurnitureMessage
	| ClientRemoveFurnitureMessage
	| ClientAddLightMessage
	| ClientUpdateLightMessage
	| ClientRemoveLightMessage
	| ClientUpdateGlobalLightingMessage;

type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;
export type ClientMessageWithoutId = DistributiveOmit<ClientMessage, 'messageId'>;
