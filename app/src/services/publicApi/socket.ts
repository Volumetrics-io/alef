import { AlefError, ClientMessage, ClientMessageWithoutId, createClientMessage, DeviceType, PrefixedId, ServerMessage, ServerMessageByType, ServerMessageType } from '@alef/common';
import toast from 'react-hot-toast';
import { publicApiClient } from './client';

/**
 * Tools for connecting to a Property realtime websocket, sending and receiving messages,
 * awaiting expected responses, etc.
 */

export type PropertySocket = {
	send: <T extends ClientMessageWithoutId>(message: T) => void;
	request: <T extends ClientMessageWithoutId, Response extends ServerMessageType = ServerMessageType>(
		message: T,
		expectedType?: Response
	) => Promise<ServerMessageByType<Response>>;
	onMessage: <T extends ServerMessageType>(type: T, handler: (message: ServerMessageByType<T>) => void) => () => void;
	onConnect: (handler: () => void) => () => void;
	unsubscribeAll: () => void;
	close: () => void;
	reconnect: () => Promise<void>;
	isClosed: boolean;
};

// cache connections to avoid duplicate sockets
const socketCache: Map<PrefixedId<'p'>, PropertySocket> = new Map();

export async function connectToSocket(propertyId: PrefixedId<'p'>): Promise<PropertySocket> {
	if (socketCache.has(propertyId)) {
		const socket = socketCache.get(propertyId)!;
		if (socket.isClosed) {
			socket.reconnect();
		}
		return socket;
	}
	const socketOrigin = import.meta.env.VITE_PUBLIC_API_ORIGIN.replace(/^http/, 'ws');
	const websocket = new ReconnectingWebsocket(`${socketOrigin}/socket`, propertyId);
	const unsubRootMessages = websocket.onMessage((message) => {
		console.debug('Received message', message);
		if (message.type === 'error') {
			toast.error(message.message);
		}
	});
	const unsubErrors = websocket.onError(console.error);

	function send<T extends ClientMessageWithoutId>(message: T) {
		(message as any).messageId = Math.random().toString().slice(2);
		websocket.send(JSON.stringify(message));
	}

	const unsubs: (() => void)[] = [];

	function request<T extends ClientMessageWithoutId, Response extends ServerMessageType = ServerMessageType>(
		message: T,
		expectedType?: Response
	): Promise<ServerMessageByType<Response>> {
		const messageId = Math.random().toString().slice(2);
		const fullMessage: ClientMessage = createClientMessage({ ...message, messageId });
		const response = new Promise<ServerMessage>((resolve, reject) => {
			const unsub = websocket.onMessage(function handler(message) {
				if (message.responseTo === messageId && (!expectedType || message.type === expectedType)) {
					unsub();
					resolve(message);
				}
			});
			unsubs.push(unsub);
			setTimeout(() => {
				reject(new Error('Request timed out'));
			}, 5000);
		});
		websocket.send(JSON.stringify(fullMessage));
		return response as any;
	}

	function subscribe<T extends ServerMessageType>(type: T, handler: (message: ServerMessageByType<T>) => void) {
		const unsub = websocket.onMessage((message) => {
			if (message.type === type) {
				handler(message as ServerMessageByType<T>);
			}
		});
		unsubs.push(unsub);
		return unsub;
	}

	const pingInterval = setInterval(() => {
		send({ type: 'ping' });
	}, 10000);
	send({ type: 'ping' });

	function unsubscribeAll() {
		unsubs.forEach((unsub) => unsub());
		unsubErrors();
		unsubRootMessages();
		clearInterval(pingInterval);
	}

	function close() {
		console.log('Closing socket', propertyId);
		unsubscribeAll();
		websocket.close();
	}

	const peers = new DevicePeers();
	subscribe('deviceConnected', (message) => {
		peers.onConnected(message.userId, message.device);
	});
	subscribe('deviceDisconnected', (message) => {
		peers.onDisconnected(message.deviceId);
	});

	const socket = {
		send,
		request,
		onMessage: subscribe,
		unsubscribeAll,
		close,
		get isClosed() {
			return websocket.isClosed;
		},
		reconnect: () => websocket.reconnect(),
		onConnect: websocket.onConnect,
		peers,
	};
	socketCache.set(propertyId, socket);
	return socket;
}

async function getSocketToken(propertyId: string) {
	const res = await publicApiClient.properties[':id'].socketToken.$get({
		param: { id: propertyId },
	});
	if (!res.ok) {
		throw new AlefError(AlefError.Code.Unknown, 'Failed to get socket token');
	}
	const body = await res.json();
	return body.token;
}

class ReconnectingWebsocket {
	private websocket: WebSocket | null = null;
	private messageEvents = new EventTarget();
	private errorEvents = new EventTarget();
	private connectEvents = new EventTarget();
	private backlog: string[] = [];

	constructor(
		private url: string,
		private propertyId: string
	) {
		this.reconnect();
	}

	get isClosed() {
		return this.websocket?.readyState === WebSocket.CLOSED;
	}

	send = (message: string) => {
		if (this.websocket?.readyState === WebSocket.OPEN) {
			this.websocket.send(message);
		} else {
			this.backlog.push(message);
		}
	};

	onMessage = (handler: (event: ServerMessage) => void) => {
		function wrappedHandler(event: Event) {
			if (event instanceof MessageEvent) {
				const msg = JSON.parse(event.data) as ServerMessage;
				handler(msg);
			}
		}
		this.messageEvents.addEventListener('message', wrappedHandler);
		return () => {
			this.messageEvents.removeEventListener('message', wrappedHandler);
		};
	};

	onError = (handler: (event: Event) => void) => {
		this.errorEvents.addEventListener('error', handler);
		return () => {
			this.errorEvents.removeEventListener('error', handler);
		};
	};

	onConnect = (handler: () => void) => {
		this.connectEvents.addEventListener('connect', handler);
		return () => {
			this.connectEvents.removeEventListener('connect', handler);
		};
	};

	close = () => {
		this.websocket?.close();
	};

	async reconnect() {
		const token = await getSocketToken(this.propertyId);
		const url = new URL(this.url);
		url.searchParams.set('token', token);
		const websocket = (this.websocket = new WebSocket(url));
		websocket.addEventListener('open', () => {
			console.log('Socket connected');
			this.connectEvents.dispatchEvent(new Event('connect'));
			if (this.backlog.length) {
				this.backlog.forEach((msg) => websocket.send(msg));
				this.backlog = [];
			}
		});
		websocket.addEventListener('close', (ev) => {
			if (ev.code === 1000) {
				console.debug('Normal socket close; not reconnecting');
				return;
			}

			setTimeout(() => {
				this.reconnect();
			}, 3000);
		});
		websocket.addEventListener('message', (event) => {
			this.messageEvents.dispatchEvent(
				new MessageEvent('message', {
					data: event.data,
				})
			);
		});
		websocket.addEventListener('error', (event) => {
			const err = event instanceof ErrorEvent ? event.error : new Error('Unknown error');
			this.errorEvents.dispatchEvent(
				new ErrorEvent('error', {
					error: err,
				})
			);
		});
	}
}

export interface DevicePeerInfo {
	id: PrefixedId<'d'>;
	name: string;
	type: DeviceType;
}

class DevicePeers extends EventTarget {
	private presence: Map<PrefixedId<'u'>, DevicePeerInfo[]> = new Map();

	onConnected = (userId: PrefixedId<'u'>, device: DevicePeerInfo) => {
		const existing = this.presence.get(userId) || [];
		this.presence.set(userId, [...existing, device]);
		this.dispatchEvent(new CustomEvent('connected', { detail: { userId, device } }));
	};
	onDisconnected = (deviceId: PrefixedId<'d'>) => {
		const matchingUserId = [...this.presence.entries()].find(([_, devices]) => devices.some((device) => device.id === deviceId))?.[0];
		if (matchingUserId) {
			const devices = this.presence.get(matchingUserId)!.filter((device) => device.id !== deviceId);
			if (devices.length === 0) {
				this.presence.delete(matchingUserId);
			} else {
				this.presence.set(matchingUserId, devices);
			}
			this.dispatchEvent(new CustomEvent('disconnected', { detail: { userId: matchingUserId, deviceId } }));
		}
	};
}
