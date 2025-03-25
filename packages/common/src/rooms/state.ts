import { z } from 'zod';
import { isPrefixedId, PrefixedId } from '../ids.js';
import { getEmptyRoomState } from './defaults.js';
import { ROOM_STATE_VERSION } from './version.js';

export const simpleVector3Shape = z.object({
	x: z.number().safe(),
	y: z.number().safe(),
	z: z.number().safe(),
});
export type SimpleVector3 = z.infer<typeof simpleVector3Shape>;

export const simpleQuaternionShape = z.object({
	x: z.number().safe(),
	y: z.number().safe(),
	z: z.number().safe(),
	w: z.number().safe(),
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

/**
 * Ensures proper state shape for a room.
 */
export function migrateRoomState(oldState: any): RoomState {
	if (!oldState?.version) {
		// can't assume much at this point. merge in default properties, delete unknowns,
		// and set version to 1.
		const defaults = getEmptyRoomState();

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
