import { idShapes, isPrefixedId, PrefixedId, roomOperationShape } from '@alef/common';
import { tool } from 'ai';
import { z } from 'zod';
import { agentContext } from './LayoutAgent';

async function getProperty(propertyId: PrefixedId<'p'>) {
	const context = agentContext.getStore();
	if (!context) {
		throw new Error('Agent context not found');
	}
	const env = context.env;
	const property = await env.PROPERTY.get(env.PROPERTY.idFromName(propertyId));
	return property;
}

export const modifyRoom = tool({
	description: "Make changes to a user's room using our discrete operations API.",
	parameters: z.object({
		propertyId: z.custom<PrefixedId<'p'>>((v) => isPrefixedId(v, 'p')),
		operations: roomOperationShape.array(),
	}),
	execute: async ({ propertyId, operations }) => {
		const property = await getProperty(propertyId);
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
