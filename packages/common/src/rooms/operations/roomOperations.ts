import { z } from 'zod';
import { isPrefixedId, PrefixedId } from '../../ids.js';
import { roomFurniturePlacementShape, roomGlobalLightingShape, roomLayoutShape, roomLightPlacementShape, roomPlaneDataShape } from '../state/roomData.js';
import { baseRoomOperationShape } from './common.js';

export const createLayoutOperationShape = baseRoomOperationShape.extend({
	type: z.literal('createLayout'),
	data: roomLayoutShape.pick({
		id: true,
		name: true,
		icon: true,
		type: true,
	}),
});
export type CreateLayoutOperation = z.infer<typeof createLayoutOperationShape>;

export const deleteLayoutOperation = baseRoomOperationShape.extend({
	type: z.literal('deleteLayout'),
	layoutId: z.custom<PrefixedId<'rl'>>((v) => isPrefixedId(v, 'rl')),
});
export type DeleteLayoutOperation = z.infer<typeof deleteLayoutOperation>;

export const updatePlanesOperationShape = baseRoomOperationShape.extend({
	type: z.literal('updatePlanes'),
	planes: roomPlaneDataShape.omit({ id: true }).array(),
	time: z.number(),
});
export type UpdatePlanesOperation = z.infer<typeof updatePlanesOperationShape>;

export const clearPlanesOperationShape = baseRoomOperationShape.extend({
	type: z.literal('clearPlanes'),
});
export type ClearPlanesOperation = z.infer<typeof clearPlanesOperationShape>;

export const addFurnitureOperationShape = baseRoomOperationShape.extend({
	type: z.literal('addFurniture'),
	roomLayoutId: z.custom<PrefixedId<'rl'>>((v) => isPrefixedId(v, 'rl')),
	data: roomFurniturePlacementShape,
});
export type AddFurnitureOperation = z.infer<typeof addFurnitureOperationShape>;

export const updateFurnitureOperationShape = baseRoomOperationShape.extend({
	type: z.literal('updateFurniture'),
	layoutId: z.custom<PrefixedId<'rl'>>((v) => isPrefixedId(v, 'rl')),
	// updates require id, but all other fields are optional.
	data: roomFurniturePlacementShape.partial().extend({
		id: z.custom<PrefixedId<'fp'>>((v) => isPrefixedId(v, 'fp')),
	}),
});
export type UpdateFurnitureOperation = z.infer<typeof updateFurnitureOperationShape>;

export const removeFurnitureOperationShape = baseRoomOperationShape.extend({
	type: z.literal('removeFurniture'),
	layoutId: z.custom<PrefixedId<'rl'>>((v) => isPrefixedId(v, 'rl')),
	id: z.custom<PrefixedId<'fp'>>((v) => isPrefixedId(v, 'fp')),
});
export type RemoveFurnitureOperation = z.infer<typeof removeFurnitureOperationShape>;

export const addLightOperationShape = baseRoomOperationShape.extend({
	type: z.literal('addLight'),
	data: roomLightPlacementShape,
});
export type AddLightOperation = z.infer<typeof addLightOperationShape>;

export const updateLightOperationShape = baseRoomOperationShape.extend({
	type: z.literal('updateLight'),
	data: roomLightPlacementShape.partial().extend({
		id: z.custom<PrefixedId<'lp'>>((v) => isPrefixedId(v, 'lp')),
	}),
});
export type UpdateLightOperation = z.infer<typeof updateLightOperationShape>;

export const removeLightOperationShape = baseRoomOperationShape.extend({
	type: z.literal('removeLight'),
	id: z.custom<PrefixedId<'lp'>>((v) => isPrefixedId(v, 'lp')),
});
export type RemoveLightOperation = z.infer<typeof removeLightOperationShape>;

export const updateGlobalLightingOperationShape = baseRoomOperationShape.extend({
	type: z.literal('updateGlobalLighting'),
	data: roomGlobalLightingShape.partial(),
});
export type UpdateGlobalLightingOperation = z.infer<typeof updateGlobalLightingOperationShape>;

export const updateRoomLayoutOperationShape = baseRoomOperationShape.extend({
	type: z.literal('updateLayout'),
	data: roomLayoutShape.pick({
		id: true,
		name: true,
		icon: true,
		type: true,
	}),
});
export type UpdateRoomLayoutOperation = z.infer<typeof updateRoomLayoutOperationShape>;

export const roomOperationShape = z.union([
	createLayoutOperationShape,
	deleteLayoutOperation,
	updatePlanesOperationShape,
	clearPlanesOperationShape,
	addFurnitureOperationShape,
	updateFurnitureOperationShape,
	removeFurnitureOperationShape,
	addLightOperationShape,
	updateLightOperationShape,
	removeLightOperationShape,
	updateGlobalLightingOperationShape,
	updateRoomLayoutOperationShape,
]);

export type RoomOperation = z.infer<typeof roomOperationShape>;
export type RoomOperationType = RoomOperation['type'];
export type RoomOperationByType<T extends RoomOperationType> = Extract<RoomOperation, { type: T }>;
