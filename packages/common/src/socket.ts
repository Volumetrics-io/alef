import { AlefErrorCode } from './error';
import { PrefixedId } from './ids';
import { Operation } from './operations';
import { RoomLayout, RoomState } from './state';

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

export interface ClientApplyOperationsMessage extends BaseClientMessage {
	type: 'applyOperations';
	operations: Operation[];
}

export type ClientMessage = ClientPingMessage | ClientRequestRoomMessage | ClientApplyOperationsMessage;

type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;
export type ClientMessageWithoutId = DistributiveOmit<ClientMessage, 'messageId'>;
