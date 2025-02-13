import { AlefError, id, PrefixedId, RoomFurniturePlacement, RoomGlobalLighting, RoomLayout, RoomLightPlacement, RoomState, Updates } from '@alef/common';
import { DurableObject } from 'cloudflare:workers';
import { Bindings } from '../config/ctx';
import { PropertySocketHandler } from './sockets/PropertySocketHandler';

function createDefaultRoomState(): Omit<RoomState, 'id'> {
	const defaultLayoutId = id('rl');
	return {
		walls: [],
		layouts: {
			[defaultLayoutId]: {
				id: defaultLayoutId,
				furniture: {},
			},
		},
		lights: {},
		globalLighting: {
			color: 2.7,
			intensity: 0.8,
		},
	};
}

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
			this.#rooms = (await this.ctx.storage.get('state')) || {};
			if (!Object.keys(this.#rooms).length) {
				// if no rooms exist, insert a default room.
				const roomId = id('r');
				this.#rooms[roomId] = { id: roomId, ...createDefaultRoomState() };
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
	#broadcastLayoutChange(roomId: PrefixedId<'r'>, _roomLayoutId?: PrefixedId<'rl'>) {
		const room = this.getRoom(roomId);
		if (!room) return;
		// Notify clients of layout change
		this.#socketHandler.send({
			type: 'roomUpdate',
			data: room,
		});
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
		this.#rooms[roomId] = { id: roomId, ...createDefaultRoomState() };
		this.#saveState();
		return this.#rooms[roomId];
	}

	createLayout(roomId: PrefixedId<'r'>, data?: Pick<RoomLayout, 'name' | 'icon'>) {
		const room = this.getRoom(roomId);
		if (!room) {
			throw new AlefError(AlefError.Code.NotFound, 'Room not found');
		}
		const layoutId = id('rl');
		room.layouts[layoutId] = { ...data, id: layoutId, furniture: {} };
		this.#saveState();
		return room.layouts[layoutId];
	}

	updateLayout(roomId: PrefixedId<'r'>, layoutId: PrefixedId<'rl'>, data: Pick<RoomLayout, 'name' | 'icon' | 'type'>) {
		const layout = this.getRoomLayout(roomId, layoutId);
		if (!layout) {
			throw new AlefError(AlefError.Code.NotFound, 'Room layout not found');
		}
		if (data.name) {
			layout.name = data.name;
		}
		if (data.icon) {
			layout.icon = data.icon;
		}
		if (data.type) {
			layout.type = data.type;
		}
		this.#saveState();
	}

	deleteLayout(roomId: PrefixedId<'r'>, layoutId: PrefixedId<'rl'>) {
		const room = this.getRoom(roomId);
		if (!room) {
			throw new AlefError(AlefError.Code.NotFound, 'Room not found');
		}
		if (!room.layouts[layoutId]) {
			throw new AlefError(AlefError.Code.NotFound, 'Room layout not found');
		}
		delete room.layouts[layoutId];
		this.#saveState();
	}

	async updateWalls(roomId: PrefixedId<'r'>, walls: RoomState['walls']) {
		const room = this.getRoom(roomId);
		if (!room) {
			throw new AlefError(AlefError.Code.NotFound, 'Room not found');
		}
		room.walls = walls;
		await this.#saveState();
	}

	async addFurniture(roomId: PrefixedId<'r'>, roomLayoutId: PrefixedId<'rl'>, furniture: RoomFurniturePlacement) {
		const layout = this.getRoomLayout(roomId, roomLayoutId);
		if (!layout) {
			throw new AlefError(AlefError.Code.NotFound, 'Room layout not found');
		}
		layout.furniture[furniture.id] = furniture;
		await this.#saveState();
		this.#broadcastLayoutChange(roomId, roomLayoutId);
	}

	async updateFurniture(roomId: PrefixedId<'r'>, roomLayoutId: PrefixedId<'rl'>, furniture: Updates<RoomFurniturePlacement>) {
		const layout = this.getRoomLayout(roomId, roomLayoutId);
		if (!layout) {
			throw new AlefError(AlefError.Code.NotFound, 'Room layout not found');
		}
		if (!layout.furniture[furniture.id]) {
			throw new AlefError(AlefError.Code.NotFound, 'Furniture not found');
		}
		layout.furniture[furniture.id] = { ...layout.furniture[furniture.id], ...furniture };
		await this.#saveState();
		this.#broadcastLayoutChange(roomId, roomLayoutId);
	}

	async removeFurniture(roomId: PrefixedId<'r'>, roomLayoutId: PrefixedId<'rl'>, id: RoomFurniturePlacement['id']) {
		const layout = this.getRoomLayout(roomId, roomLayoutId);
		if (!layout) {
			throw new AlefError(AlefError.Code.NotFound, 'Room layout not found');
		}
		delete layout.furniture[id];
		await this.#saveState();
		this.#broadcastLayoutChange(roomId, roomLayoutId);
	}

	async addLight(roomId: PrefixedId<'r'>, light: RoomLightPlacement) {
		const room = this.getRoom(roomId);
		if (!room) {
			throw new AlefError(AlefError.Code.NotFound, 'Room layout not found');
		}
		room.lights ??= {};
		room.lights[light.id] = light;
		await this.#saveState();
		this.#broadcastLayoutChange(roomId);
	}

	async updateLight(roomId: PrefixedId<'r'>, light: Updates<RoomLightPlacement>) {
		const room = this.getRoom(roomId);
		if (!room) {
			throw new AlefError(AlefError.Code.NotFound, 'Room layout not found');
		}
		if (!room.lights[light.id]) {
			throw new AlefError(AlefError.Code.NotFound, 'Light not found');
		}
		room.lights[light.id] = { ...room.lights[light.id], ...light };
		await this.#saveState();
		this.#broadcastLayoutChange(roomId);
	}

	async removeLight(roomId: PrefixedId<'r'>, id: RoomLightPlacement['id']) {
		const room = this.getRoom(roomId);
		if (!room) {
			throw new AlefError(AlefError.Code.NotFound, 'Room layout not found');
		}
		delete room.lights[id];
		await this.#saveState();
		this.#broadcastLayoutChange(roomId);
	}

	async updateGlobalLighting(roomId: PrefixedId<'r'>, data: Partial<RoomGlobalLighting>) {
		const room = this.getRoom(roomId);
		if (!room) {
			throw new AlefError(AlefError.Code.NotFound, 'Room not found');
		}
		room.globalLighting = { ...room.globalLighting, ...data };
		await this.#saveState();
		this.#broadcastLayoutChange(roomId, id('rl'));
	}
}
