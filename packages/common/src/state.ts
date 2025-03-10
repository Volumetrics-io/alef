import { z } from 'zod';
import { AlefError } from './error';
import { id, isPrefixedId, PrefixedId } from './ids';
import { Operation } from './operations';
import { mergePlanes } from './planes';

export const ROOM_STATE_VERSION = 1;

export const simpleVector3Shape = z.object({
	x: z.number(),
	y: z.number(),
	z: z.number(),
});
export type SimpleVector3 = z.infer<typeof simpleVector3Shape>;

export const simpleQuaternionShape = z.object({
	x: z.number(),
	y: z.number(),
	z: z.number(),
	w: z.number(),
});
export type SimpleQuaternion = z.infer<typeof simpleQuaternionShape>;

export const roomPlaneDataShape = z.object({
	id: z.custom<PrefixedId<'rp'>>((v) => isPrefixedId(v, 'rp')),
	label: z.string(),
	origin: simpleVector3Shape,
	orientation: simpleQuaternionShape,
	extents: z.tuple([z.number(), z.number()]),
});
export type RoomPlaneData = z.infer<typeof roomPlaneDataShape>;

export const roomFurniturePlacementShape = z.object({
	id: z.custom<PrefixedId<'fp'>>((v) => isPrefixedId(v, 'fp')),
	position: simpleVector3Shape,
	rotation: simpleQuaternionShape,
	furnitureId: z.custom<PrefixedId<'f'>>((v) => isPrefixedId(v, 'f')),
});
export type RoomFurniturePlacement = z.infer<typeof roomFurniturePlacementShape>;

export const roomLightPlacementShape = z.object({
	id: z.custom<PrefixedId<'lp'>>((v) => isPrefixedId(v, 'lp')),
	position: simpleVector3Shape,
});
export type RoomLightPlacement = z.infer<typeof roomLightPlacementShape>;

export const roomGlobalLightingShape = z.object({
	color: z.number(),
	intensity: z.number(),
});
export type RoomGlobalLighting = z.infer<typeof roomGlobalLightingShape>;

export const roomLayoutShape = z.object({
	id: z.custom<PrefixedId<'rl'>>((v) => isPrefixedId(v, 'rl')),
	furniture: z.record(
		z.custom<PrefixedId<'fp'>>((v) => isPrefixedId(v, 'fp')),
		roomFurniturePlacementShape
	),
	icon: z.string().optional(),
	name: z.string().optional(),
	type: z.string().optional(),
});
export type RoomLayout = z.infer<typeof roomLayoutShape>;

export const roomStateShape = z.object({
	id: z.custom<PrefixedId<'r'>>((v) => isPrefixedId(v, 'r')),
	version: z.number(),
	planes: roomPlaneDataShape.array(),
	planesUpdatedAt: z.number().nullable(),
	layouts: z.record(
		z.custom<PrefixedId<'rl'>>((v) => isPrefixedId(v, 'rl')),
		roomLayoutShape
	),
	lights: z.record(
		z.custom<PrefixedId<'lp'>>((v) => isPrefixedId(v, 'lp')),
		roomLightPlacementShape
	),
	globalLighting: roomGlobalLightingShape,
});
export type RoomState = z.infer<typeof roomStateShape>;

export type UnknownRoomPlaneData = Omit<RoomPlaneData, 'id'>;

export type Updates<T extends { id: any }> = T extends { id: infer U } ? { id: U } & Partial<Omit<T, 'id'>> : T;

export function updateRoom(state: RoomState, change: Operation) {
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

/**
 * Ensures proper state shape for a room.
 */
export function migrateRoomState(oldState: any): RoomState {
	if (!oldState.version) {
		// can't assume much at this point. merge in default properties, delete unknowns,
		// and set version to 1.
		const defaults = getDefaultRoomState();

		// attempt to parse each property to ensure it's valid.
		// if not valid, we discard it.
		// This kind of safety is only needed because we're migrating from an unknown state.
		// Future versioned migrations can be a little less fastidious.
		const planes: RoomPlaneData[] =
			oldState.planes
				?.map((p: any) => {
					return roomPlaneDataShape.safeParse(p).success ? p : null;
				})
				.filter((p: any) => p !== null) ?? defaults.planes;
		const layouts: Record<PrefixedId<'rl'>, RoomLayout> = Object.fromEntries(
			Object.entries(oldState.layouts ?? {})
				.map(([id, layout]: [string, any]): [string, any] => {
					return [id, roomLayoutShape.safeParse(layout).success ? layout : null];
				})
				.filter(([_, layout]: [string, any]) => layout !== null)
		) ?? defaults.layouts;
		const lights: Record<PrefixedId<'lp'>, RoomLightPlacement> = Object.fromEntries(
			Object.entries(oldState.lights ?? {})
				.map(([id, light]: [string, any]): [string, any] => {
					return [id, roomLightPlacementShape.safeParse(light).success ? light : null];
				})
				.filter(([_, light]: [string, any]) => light !== null)
		) ?? defaults.lights;
		const globalLighting: RoomGlobalLighting = roomGlobalLightingShape.safeParse(oldState.globalLighting).success ? oldState.globalLighting : defaults.globalLighting;

		return {
			version: ROOM_STATE_VERSION,
			id: oldState.id ?? defaults.id,
			planes,
			planesUpdatedAt: oldState.planesUpdatedAt ?? defaults.planesUpdatedAt,
			layouts,
			lights,
			globalLighting,
		};
	} else if (oldState.version === ROOM_STATE_VERSION) {
		// check validity of state just in case.
		try {
			return roomStateShape.parse(oldState);
		} catch (err) {
			// fallback to unknown.
			return migrateRoomState({ ...oldState, version: undefined });
		}
	} else {
		throw new Error(`Unsupported room state version ${oldState.version}`);
	}
}

export function getDefaultRoomState(idOverride?: PrefixedId<'r'>): RoomState {
	const defaultLayoutId = id('rl');
	return {
		id: idOverride || id('r'),
		version: ROOM_STATE_VERSION,
		planes: [],
		planesUpdatedAt: null,
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
