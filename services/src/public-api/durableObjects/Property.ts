import { AlefError, getDemoRoomState, id, migrateRoomState, Operation, PrefixedId, RoomState, updateRoom } from '@alef/common';
import { DurableObject } from 'cloudflare:workers';
import { Bindings } from '../config/ctx';
import { PropertySocketHandler } from './sockets/PropertySocketHandler';

export class Property extends DurableObject<Bindings> {
	#rooms: Record<PrefixedId<'r'>, RoomState> = {};
	#socketHandler;

	constructor(ctx: DurableObjectState, env: Bindings) {
		super(ctx, env);
		this.#socketHandler = new PropertySocketHandler(this, ctx, env);
		this.#loadState();
	}

	// connect fetch to socket handler to connect and manage websockets
	fetch(req: Request) {
		return this.#socketHandler.handleFetch(req);
	}
	webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): void | Promise<void> {
		return this.#socketHandler.handleMessage(ws, message);
	}
	webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean): void | Promise<void> {
		return this.#socketHandler.handleClose(ws, code, reason, wasClean);
	}
	webSocketError(ws: WebSocket, error: unknown): void | Promise<void> {
		return this.#socketHandler.handleError(ws, error);
	}

	async #loadState() {
		// Load state from storage
		await this.ctx.blockConcurrencyWhile(async () => {
			// Apply migrations to state before assigning
			const loadedRooms = (await this.ctx.storage.get('state')) || {};
			this.#rooms = Object.fromEntries(Object.entries(loadedRooms).map(([id, roomState]) => [id, migrateRoomState(roomState)]));
			if (!Object.keys(this.#rooms).length) {
				// if no rooms exist, insert a default room.
				const roomId = id('r');
				this.#rooms[roomId] = getDemoRoomState(roomId);
				await this.#saveState();
			}
		});
		console.info(`[${this.ctx.id.toString()}] Loaded state`);
	}

	async #saveState() {
		// Save state to storage
		await this.ctx.storage.put('state', this.#rooms);
		console.info(`[${this.ctx.id.toString()}] Saved state`);
	}

	// note: layout ID not currently used, updates are not very granular with
	// the current protocol, we just send the whole room.
	#broadcastChange(roomId: PrefixedId<'r'>, _roomLayoutId?: PrefixedId<'rl'>) {
		const room = this.getRoom(roomId);
		if (!room) return;
		// Notify clients of layout change
		this.#socketHandler.send({
			type: 'roomUpdate',
			data: room,
		});
	}

	applyOperations(operations: Operation[]) {
		const affectedRooms = new Set<PrefixedId<'r'>>();
		for (const op of operations) {
			updateRoom(this.#rooms[op.roomId], op);
			affectedRooms.add(op.roomId);
		}
		this.#saveState();
		for (const roomId of affectedRooms) {
			this.#broadcastChange(roomId);
		}
	}

	async getAllRooms() {
		return this.#rooms;
	}

	getRoom(roomId: PrefixedId<'r'>) {
		return this.#rooms[roomId];
	}

	getRoomLayout(roomId: PrefixedId<'r'>, roomLayoutId: PrefixedId<'rl'>) {
		const room = this.getRoom(roomId);
		if (!room) {
			throw new AlefError(AlefError.Code.NotFound, 'Room not found');
		}
		return room.layouts[roomLayoutId];
	}

	createRoom() {
		const roomId = id('r');
		this.#rooms[roomId] = getDemoRoomState(roomId);
		this.#saveState();
		return this.#rooms[roomId];
	}
}
