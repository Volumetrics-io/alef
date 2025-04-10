import { id, idShapes, PrefixedId, roomOperationShape } from '@alef/common';
import { tool } from 'ai';
import { z } from 'zod';
import { agentContext } from './LayoutAgent';

async function getProperty(propertyId: PrefixedId<'p'>) {
	const context = agentContext.getStore();
	if (!context) {
		throw new Error('Agent context not found');
	}
	const env = context.env;
	const doId = await env.PROPERTY.idFromName(propertyId);
	const property = await env.PROPERTY.get(doId);
	return property;
}

export const modifyRoom = tool({
	description: `Make changes to a user's room using our discrete operations API. Please note that this tool accepts a variety of named 'operations,' which are objects describing a discrete change to the layout, but are not tools themselves. In order to apply these discrete operations, you must call this tool (modifyRoom) with a list of operations you want to apply.`,
	parameters: z.object({
		propertyId: idShapes.Property,
		operations: roomOperationShape
			.array()
			.describe(
				'A list of discrete operations to apply to the room. Each operation has a type which determines what kind of change it applies, and other payload data which describe the change.'
			),
	}),
	execute: async ({ propertyId, operations }) => {
		console.debug(`Agent is applying operations to property ${propertyId}:`, JSON.stringify(operations));
		const property = await getProperty(propertyId);
		if (!property) {
			throw new Error(`Property ${propertyId} not found`);
		}
		// validate/sanitize the operations
		operations = operations.map((op) => ({
			...op,
			// generate a new random ID.
			opId: id('op'),
		}));
		// apply the operations to the property
		await property.applyOperations(operations);
	},
});

export const getRoomLayoutContext = tool({
	description: 'Retrieve the layout of a room, including context about the physical planes (floor, ceiling, walls, windows, doors), and furniture in the room.',
	parameters: z.object({
		propertyId: idShapes.Property,
		roomId: idShapes.Room,
		layoutId: idShapes.RoomLayout,
	}),
	execute: async ({ propertyId, roomId, layoutId }) => {
		console.debug(`Agent is retrieving layout for property ${propertyId}, room ${roomId}, layout ${layoutId}`);
		const context = agentContext.getStore();
		if (!context) {
			throw new Error('Agent context not found');
		}

		const property = await getProperty(propertyId);
		const room = await property.getRoom(roomId);
		if (!room) {
			throw new Error(`Room ${roomId} not found`);
		}
		const layout = room.layouts[layoutId];
		if (!layout) {
			throw new Error(`Layout ${layoutId} not found in room ${roomId}`);
		}

		// connect the global room data, layout, and furniture details
		const furnitureIds = Object.values(layout.furniture)
			.map((f) => f?.furnitureId)
			.filter((f) => !!f);
		const furnitureDetails = await context.env.PUBLIC_STORE.getMultipleFurniture(furnitureIds);
		const furniture = Object.fromEntries(
			Object.entries(layout.furniture)
				.map(([id, furniturePlacement]) => {
					if (!furniturePlacement) {
						return [id, furniturePlacement];
					}
					const furnitureDetail = furnitureDetails.find((f) => f.id === furniturePlacement?.furnitureId);
					return [
						id,
						{
							...furniturePlacement,
							dimensions: { x: furnitureDetail?.measuredDimensionsX ?? 0, y: furnitureDetail?.measuredDimensionsY ?? 0, z: furnitureDetail?.measuredDimensionsZ ?? 0 },
							attributes: furnitureDetail?.attributes,
							name: furnitureDetail?.name,
						},
					];
				})
				.filter(([, f]) => !!f)
		);

		return {
			id: layout.id,
			lights: room.lights,
			planes: room.planes,
			furniture,
			name: layout.name,
			type: layout.type,
		};
	},
});

export const tools = { modifyRoom, getRoomLayoutContext };
