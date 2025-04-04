import { z } from 'zod';
import { isPrefixedId, PrefixedId } from '../ids.js';
import { getEmptyRoomState } from './defaults.js';
import { editorStateShape } from './state/editor.js';
import {
	RoomGlobalLighting,
	roomGlobalLightingShape,
	RoomLayout,
	roomLayoutShape,
	RoomLightPlacement,
	roomLightPlacementShape,
	RoomPlaneData,
	roomPlaneDataShape,
} from './state/roomData.js';
import { ROOM_STATE_VERSION } from './version.js';

export const roomStateInitializationShape = z.object({
	version: z.number(),
	createdAt: z.number(),
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

export const roomStateShapeWithoutEditor = roomStateInitializationShape.extend({
	id: z.custom<PrefixedId<'r'>>((v) => isPrefixedId(v, 'r')),
	updatedAt: z.number().nullable(),
});

export const roomStateShape = roomStateShapeWithoutEditor.extend({
	// some clients may not have an editor state -- the server, for example.
	editor: editorStateShape.optional(),
});
export type RoomState = z.infer<typeof roomStateShape>;
export type RoomStateInit = z.infer<typeof roomStateInitializationShape>;
// a version of RoomState where editor is required.
export type RoomStateWithEditor = RoomState & { editor: z.infer<typeof editorStateShape> };

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
			createdAt: oldState.createdAt ?? defaults.createdAt,
			updatedAt: oldState.updatedAt ?? defaults.updatedAt,
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
