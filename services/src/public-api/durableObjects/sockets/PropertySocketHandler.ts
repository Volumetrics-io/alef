import { AlefError, assertPrefixedId, ClientMessage, PrefixedId, ServerMessage, ServerRoomUpdateMessage } from '@alef/common';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { verifySocketToken } from '../../auth/socketTokens';
import { Bindings, Env } from '../../config/ctx';
import { type Property } from '../Property';

export interface SocketSessionInfo {
	userId: PrefixedId<'u'>;
	socketId: string;
	/**
	 * Keeps track of whether the socket is ready to receive messages.
	 * If the socket is not ready, messages will be queued until it is.
	 */
	status: 'pending' | 'ready' | 'closed';
}

export class PropertySocketHandler {
	#property;
	#app;
	#ctx;
	#env;
	#socketInfo: Map<WebSocket, SocketSessionInfo> = new Map();
	// map of socket id -> messages waiting to be sent until socket is confirmed
	#messageBacklogs = new Map<string, ServerMessage[]>();

	constructor(property: Property, ctx: DurableObjectState, env: Bindings) {
		this.#property = property;
		this.#ctx = ctx;
		this.#env = env;
		this.#app = new Hono<Env>().all(
			'/socket',
			zValidator(
				'query',
				z.object({
					token: z.string(),
				})
			),
			async (ctx) => {
				// expect to receive a Websocket Upgrade request
				const upgradeHeader = ctx.req.header('Upgrade');
				if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
					throw new AlefError(AlefError.Code.BadRequest, 'Expected a WebSocket upgrade request');
				}

				// validate token and read game session id and user to connect to
				const token = ctx.req.valid('query').token;
				const { sub: userId } = await verifySocketToken(token, this.#env.SOCKET_TOKEN_SECRET);

				assertPrefixedId(userId, 'u');

				const webSocketPair = new WebSocketPair();
				const [client, server] = Object.values(webSocketPair);

				this.#ctx.acceptWebSocket(server);

				// map the socket to the token info for later reference.
				this.#updateSocketInfo(server, {
					userId,
					socketId: crypto.randomUUID(),
					status: 'pending',
				});

				return new Response(null, {
					status: 101,
					webSocket: client,
				});
			}
		);
	}

	handleFetch = async (req: Request) => {
		return this.#app.fetch(req);
	};

	handleMessage = async (ws: WebSocket, event: string | ArrayBuffer) => {
		const info = this.#socketInfo.get(ws);
		if (info?.status === 'pending') {
			this.#updateSocketInfo(ws, { ...info, status: 'ready' });
			console.log('Socket ready', info.socketId, info.userId, 'sending backlog');
			this.#messageBacklogs.get(info.socketId)?.forEach((msg) => {
				ws.send(JSON.stringify(msg));
			});
		}

		const messageStr = typeof event === 'string' ? event : new TextDecoder().decode(event);
		const message = JSON.parse(messageStr) as ClientMessage;
		try {
			switch (message.type) {
				case 'requestRoom':
					const room = this.#property.getRoom(message.roomId);
					if (!room) {
						throw new AlefError(AlefError.Code.NotFound, 'Room not found');
					}
					ws.send(JSON.stringify({ responseTo: message.messageId, type: 'roomUpdate', data: room } satisfies ServerRoomUpdateMessage));
					break;
				case 'ping':
					break;
				case 'applyOperations':
					this.#property.applyOperations(message.operations);
					break;
				default:
					break;
			}

			// ack the message
			ws.send(JSON.stringify({ responseTo: message.messageId, type: 'ack' }));
		} catch (err) {
			// respond with error
			const asAlefError = AlefError.wrap(err);
			ws.send(
				JSON.stringify({ responseTo: message.messageId, type: 'error', message: asAlefError.statusCode >= 500 ? 'Unknown error' : asAlefError.message, code: asAlefError.code })
			);
		}
	};

	handleClose = async (ws: WebSocket, code: number, reason: string, wasClean: boolean) => {
		this.#onWebSocketCloseOrError(ws);
	};

	handleError = async (ws: WebSocket, error: unknown) => {
		console.error('Socket error', JSON.stringify(ws.deserializeAttachment()), error);
		this.#onWebSocketCloseOrError(ws);
	};

	#updateSocketInfo(ws: WebSocket, info: SocketSessionInfo) {
		this.#socketInfo.set(ws, info);
		// persists this data to the socket itself, even when the DO is restarted
		ws.serializeAttachment(info);
	}

	#onWebSocketCloseOrError = (ws: WebSocket) => {
		// TODO: collaboration: signal to peers that this client has disconnected
		this.#socketInfo.delete(ws);
	};

	send = async (
		msg: ServerMessage,
		{
			to,
		}: {
			to?: PrefixedId<'u'>[];
		} = {}
	) => {
		const sockets = Array.from(this.#socketInfo.entries());
		for (const [ws, { userId, status, socketId }] of sockets) {
			if (to && !to.includes(userId)) {
				continue;
			}
			if (status === 'pending') {
				// push to backlog
				let backlog = this.#messageBacklogs.get(socketId);
				if (!backlog) {
					backlog = [];
					this.#messageBacklogs.set(socketId, backlog);
				}
				backlog.push(msg);
				console.log('backlogged message for socket', socketId, userId, backlog);
			} else if (status === 'closed') {
				this.#socketInfo.delete(ws);
				console.error(`Cannot send message to closed socket: { userId: ${userId}, socketId: ${socketId} }`);
			} else {
				ws.send(JSON.stringify(msg));
			}
		}
	};
}
