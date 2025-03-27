import { z } from 'zod';
import { AlefErrorCode } from './error.js';
import { isPrefixedId, PrefixedId } from './ids.js';
import { roomLayoutShape, roomStateShape } from './rooms/index.js';
import { operationShape } from './rooms/operations.js';

/**
 *
 * Server messages
 *
 */

const baseServerMessageShape = z.object({
	/**
	 * A message ID for any message sent from the client that this
	 * message serves as a response to.
	 */
	responseTo: z.string().optional(),
});

/**
 * Just a read receipt.
 */
export const serverAckMessageShape = baseServerMessageShape.extend({
	type: z.literal('ack'),
});
export type ServerAckMessage = z.infer<typeof serverAckMessageShape>;

export const serverErrorMessageShape = baseServerMessageShape.extend({
	type: z.literal('error'),
	message: z.string(),
	code: z.nativeEnum(AlefErrorCode),
});
export type ServerErrorMessage = z.infer<typeof serverErrorMessageShape>;

export const serverRoomUpdateMessageShape = baseServerMessageShape.extend({
	type: z.literal('roomUpdate'),
	data: roomStateShape,
});
export type ServerRoomUpdateMessage = z.infer<typeof serverRoomUpdateMessageShape>;

export const serverSyncOperationsMessageShape = baseServerMessageShape.extend({
	type: z.literal('syncOperations'),
	operations: operationShape.array(),
});
export type ServerSyncOperationsMessage = z.infer<typeof serverSyncOperationsMessageShape>;

export const serverLayoutCreatedMessageShape = baseServerMessageShape.extend({
	type: z.literal('layoutCreated'),
	data: roomLayoutShape,
});
export type ServerLayoutCreatedMessage = z.infer<typeof serverLayoutCreatedMessageShape>;

export const serverMessageShape = z.union([
	serverAckMessageShape,
	serverErrorMessageShape,
	serverRoomUpdateMessageShape,
	serverLayoutCreatedMessageShape,
	serverSyncOperationsMessageShape,
]);
export type ServerMessage = z.infer<typeof serverMessageShape>;

export type ServerMessageType = ServerMessage['type'];
export type ServerMessageByType<T extends ServerMessageType> = Extract<ServerMessage, { type: T }>;

/**
 * Validates the message data for you.
 */
export function createServerMessage(msg: ServerMessage) {
	return serverMessageShape.parse(msg);
}

/**
 *
 * Client messages
 *
 */

const baseClientMessageShape = z.object({
	/**
	 * A message ID for this message.
	 */
	messageId: z.string(),
});

export const clientPingMessageShape = baseClientMessageShape.extend({
	type: z.literal('ping'),
});
export type ClientPingMessage = z.infer<typeof clientPingMessageShape>;

export const clientRequestRoomMessageShape = baseClientMessageShape.extend({
	type: z.literal('requestRoom'),
	roomId: z.custom<PrefixedId<'r'>>((v) => isPrefixedId(v, 'r')),
});
export type ClientRequestRoomMessage = z.infer<typeof clientRequestRoomMessageShape>;

export const clientApplyOperationsMessageShape = baseClientMessageShape.extend({
	type: z.literal('applyOperations'),
	operations: operationShape.array(),
});
export type ClientApplyOperationsMessage = z.infer<typeof clientApplyOperationsMessageShape>;

export const clientMessageShape = z.union([clientPingMessageShape, clientRequestRoomMessageShape, clientApplyOperationsMessageShape]);
export type ClientMessage = z.infer<typeof clientMessageShape>;
export type ClientMessageType = ClientMessage['type'];

type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;
export type ClientMessageWithoutId = DistributiveOmit<ClientMessage, 'messageId'>;

export function createClientMessage(msg: ClientMessage) {
	return clientMessageShape.parse(msg);
}
