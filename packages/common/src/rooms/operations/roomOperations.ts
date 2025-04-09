import { z } from 'zod';
import { idShapes } from '../../ids.js';
import { roomFurniturePlacementShape, roomGlobalLightingShape, roomLayoutShape, roomLightPlacementShape, roomPlaneDataShape } from '../state/roomData.js';
import { baseRoomOperationShape } from './common.js';

export const createLayoutOperationShape = baseRoomOperationShape
	.extend({
		type: z.literal('createLayout'),
		data: roomLayoutShape
			.pick({
				id: true,
				name: true,
				icon: true,
				type: true,
			})
			.describe('Initial parameters for the new layout'),
	})
	.describe(
		"Create a new room layout. This will create a new layout with the given name, icon, and type. The layout will be created with the default planes and furniture. The layout will be added to the room's list of layouts."
	);
export type CreateLayoutOperation = z.infer<typeof createLayoutOperationShape>;

export const deleteLayoutOperation = baseRoomOperationShape
	.extend({
		type: z.literal('deleteLayout'),
		layoutId: idShapes.RoomLayout,
	})
	.describe('Delete a room layout. This will remove the layout and all furniture and lights associated with it.');
export type DeleteLayoutOperation = z.infer<typeof deleteLayoutOperation>;

export const updatePlanesOperationShape = baseRoomOperationShape
	.extend({
		type: z.literal('updatePlanes'),
		planes: roomPlaneDataShape.omit({ id: true }).array().describe('The planes of the room. This includes the floor, ceiling, and walls.'),
		time: z.number().describe('The time in milliseconds since the epoch when the planes were updated.'),
	})
	.describe(
		"Update the planes of the room. This includes the floor, ceiling, and walls. The planes are defined in a 3D space with a right-handed coordinate system. The planes are defined in the local space of the room, so they are relative to the room's main floor origin."
	);
export type UpdatePlanesOperation = z.infer<typeof updatePlanesOperationShape>;

export const addFurnitureOperationShape = baseRoomOperationShape
	.extend({
		type: z.literal('addFurniture'),
		roomLayoutId: idShapes.RoomLayout,
		data: roomFurniturePlacementShape,
	})
	.describe(
		"Add furniture to a room layout. This will add the furniture to the layout and set its position and rotation. The furniture will be added to the layout's furniture list, and the layout's furniture list will be updated to include the new furniture."
	);
export type AddFurnitureOperation = z.infer<typeof addFurnitureOperationShape>;

export const updateFurnitureOperationShape = baseRoomOperationShape
	.extend({
		type: z.literal('updateFurniture'),
		layoutId: idShapes.RoomLayout,
		// updates require id, but all other fields are optional.
		data: roomFurniturePlacementShape
			.partial()
			.extend({
				id: idShapes.FurniturePlacement,
			})
			.describe('Changes to be applied to the furniture placement. This includes position, rotation, and selected furniture item.'),
	})
	.describe(
		'Update furniture in a room layout. This will update the furniture in the layout and set its position and rotation, or change which furniture is placed in this position.'
	);
export type UpdateFurnitureOperation = z.infer<typeof updateFurnitureOperationShape>;

export const removeFurnitureOperationShape = baseRoomOperationShape
	.extend({
		type: z.literal('removeFurniture'),
		layoutId: idShapes.RoomLayout,
		id: idShapes.FurniturePlacement,
	})
	.describe('Remove furniture from a room layout. This will remove the furniture from the layout.');
export type RemoveFurnitureOperation = z.infer<typeof removeFurnitureOperationShape>;

export const addLightOperationShape = baseRoomOperationShape
	.extend({
		type: z.literal('addLight'),
		data: roomLightPlacementShape,
	})
	.describe('Add a light to the room.');
export type AddLightOperation = z.infer<typeof addLightOperationShape>;

export const updateLightOperationShape = baseRoomOperationShape
	.extend({
		type: z.literal('updateLight'),
		data: roomLightPlacementShape.partial().extend({
			id: idShapes.LightPlacement,
		}),
	})
	.describe('Update the placement of a light within the room.');
export type UpdateLightOperation = z.infer<typeof updateLightOperationShape>;

export const removeLightOperationShape = baseRoomOperationShape
	.extend({
		type: z.literal('removeLight'),
		id: idShapes.LightPlacement,
	})
	.describe('Remove a light from the room.');
export type RemoveLightOperation = z.infer<typeof removeLightOperationShape>;

export const updateGlobalLightingOperationShape = baseRoomOperationShape
	.extend({
		type: z.literal('updateGlobalLighting'),
		data: roomGlobalLightingShape.partial().describe('Partial changes to apply to the existing global lighting options.'),
	})
	.describe('Update the global lighting settings for the room.');
export type UpdateGlobalLightingOperation = z.infer<typeof updateGlobalLightingOperationShape>;

export const updateRoomLayoutOperationShape = baseRoomOperationShape
	.extend({
		type: z.literal('updateLayout'),
		data: roomLayoutShape.pick({
			id: true,
			name: true,
			icon: true,
			type: true,
		}),
	})
	.describe('Update the metadata of a room layout.');
export type UpdateRoomLayoutOperation = z.infer<typeof updateRoomLayoutOperationShape>;

export const roomOperationShape = z.union([
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

export type RoomOperation = z.infer<typeof roomOperationShape>;
export type RoomOperationType = RoomOperation['type'];
export type RoomOperationByType<T extends RoomOperationType> = Extract<RoomOperation, { type: T }>;
