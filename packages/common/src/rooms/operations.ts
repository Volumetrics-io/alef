import { z } from 'zod';
import { isPrefixedId, PrefixedId } from '../ids.js';
import { roomFurniturePlacementShape, roomGlobalLightingShape, roomLayoutShape, roomLightPlacementShape, roomPlaneDataShape } from './state.js';

export const createLayoutOperationShape = z.object({
	type: z.literal('createLayout'),
	roomId: z.custom<PrefixedId<'r'>>((v) => isPrefixedId(v, 'r')),
	data: roomLayoutShape.pick({
		id: true,
		name: true,
		icon: true,
		type: true,
	}),
});
export type CreateLayoutOperation = z.infer<typeof createLayoutOperationShape>;

export const deleteLayoutOperation = z.object({
	type: z.literal('deleteLayout'),
	roomId: z.custom<PrefixedId<'r'>>((v) => isPrefixedId(v, 'r')),
	roomLayoutId: z.custom<PrefixedId<'rl'>>((v) => isPrefixedId(v, 'rl')),
});
export type DeleteLayoutOperation = z.infer<typeof deleteLayoutOperation>;

export const updatePlanesOperationShape = z.object({
	type: z.literal('updatePlanes'),
	roomId: z.custom<PrefixedId<'r'>>((v) => isPrefixedId(v, 'r')),
	planes: roomPlaneDataShape.omit({ id: true }).array(),
	time: z.number(),
});
export type UpdatePlanesOperation = z.infer<typeof updatePlanesOperationShape>;

export const addFurnitureOperationShape = z.object({
	type: z.literal('addFurniture'),
	roomId: z.custom<PrefixedId<'r'>>((v) => isPrefixedId(v, 'r')),
	roomLayoutId: z.custom<PrefixedId<'rl'>>((v) => isPrefixedId(v, 'rl')),
	data: roomFurniturePlacementShape,
});
export type AddFurnitureOperation = z.infer<typeof addFurnitureOperationShape>;

export const updateFurnitureOperationShape = z.object({
	type: z.literal('updateFurniture'),
	roomId: z.custom<PrefixedId<'r'>>((v) => isPrefixedId(v, 'r')),
	roomLayoutId: z.custom<PrefixedId<'rl'>>((v) => isPrefixedId(v, 'rl')),
	// updates require id, but all other fields are optional.
	data: roomFurniturePlacementShape.partial().extend({
		id: z.custom<PrefixedId<'fp'>>((v) => isPrefixedId(v, 'fp')),
	}),
});
export type UpdateFurnitureOperation = z.infer<typeof updateFurnitureOperationShape>;

export const removeFurnitureOperationShape = z.object({
	type: z.literal('removeFurniture'),
	roomId: z.custom<PrefixedId<'r'>>((v) => isPrefixedId(v, 'r')),
	roomLayoutId: z.custom<PrefixedId<'rl'>>((v) => isPrefixedId(v, 'rl')),
	id: z.custom<PrefixedId<'fp'>>((v) => isPrefixedId(v, 'fp')),
});
export type RemoveFurnitureOperation = z.infer<typeof removeFurnitureOperationShape>;

export const addLightOperationShape = z.object({
	type: z.literal('addLight'),
	roomId: z.custom<PrefixedId<'r'>>((v) => isPrefixedId(v, 'r')),
	data: roomLightPlacementShape,
});
export type AddLightOperation = z.infer<typeof addLightOperationShape>;

export const updateLightOperationShape = z.object({
	type: z.literal('updateLight'),
	roomId: z.custom<PrefixedId<'r'>>((v) => isPrefixedId(v, 'r')),
	data: roomLightPlacementShape.partial().extend({
		id: z.custom<PrefixedId<'lp'>>((v) => isPrefixedId(v, 'lp')),
	}),
});
export type UpdateLightOperation = z.infer<typeof updateLightOperationShape>;

export const removeLightOperationShape = z.object({
	type: z.literal('removeLight'),
	roomId: z.custom<PrefixedId<'r'>>((v) => isPrefixedId(v, 'r')),
	id: z.custom<PrefixedId<'lp'>>((v) => isPrefixedId(v, 'lp')),
});
export type RemoveLightOperation = z.infer<typeof removeLightOperationShape>;

export const updateGlobalLightingOperationShape = z.object({
	type: z.literal('updateGlobalLighting'),
	roomId: z.custom<PrefixedId<'r'>>((v) => isPrefixedId(v, 'r')),
	data: roomGlobalLightingShape.partial(),
});
export type UpdateGlobalLightingOperation = z.infer<typeof updateGlobalLightingOperationShape>;

export const updateRoomLayoutOperationShape = z.object({
	type: z.literal('updateLayout'),
	roomId: z.custom<PrefixedId<'r'>>((v) => isPrefixedId(v, 'r')),
	data: roomLayoutShape.pick({
		id: true,
		name: true,
		icon: true,
		type: true,
	}),
});
export type UpdateRoomLayoutOperation = z.infer<typeof updateRoomLayoutOperationShape>;

export const operationShape = z.union([
	createLayoutOperationShape,
	deleteLayoutOperation,
	updatePlanesOperationShape,
	addFurnitureOperationShape,
	updateFurnitureOperationShape,
	removeFurnitureOperationShape,
	addLightOperationShape,
	updateLightOperationShape,
	removeLightOperationShape,
	updateGlobalLightingOperationShape,
	updateRoomLayoutOperationShape,
]);
export type Operation = z.infer<typeof operationShape>;
export type OperationType = Operation['type'];
export type OperationByType<T extends OperationType> = Extract<Operation, { type: T }>;

export function createOperation(op: Operation) {
	return operationShape.parse(op);
}
