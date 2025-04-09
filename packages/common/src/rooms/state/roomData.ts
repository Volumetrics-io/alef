import { z } from 'zod';
import { PrefixedId, idShapes, isPrefixedId } from '../../ids.js';
import { simpleQuaternionShape, simpleVector3Shape } from './common.js';

export const roomPlaneDataShape = z
	.object({
		id: idShapes.RoomPlane,
		label: z.string().describe('A semantic label assigned to the plane by the operating system in VR/AR'),
		origin: simpleVector3Shape,
		orientation: simpleQuaternionShape,
		extents: z.tuple([z.number(), z.number()]).describe('The width and height of the plane, in meters.'),
	})
	.describe(
		'Describes a plane of a room (a floor, ceiling, wall, window, or other detected plane) as seen by an AR or VR device using room scanning. All planes are relatively positioned and oriented to one primary plane, usually the floor. The primary plane will have a transform that is close to or equal to the identity transform.'
	);
export type RoomPlaneData = z.infer<typeof roomPlaneDataShape>;

export const roomFurniturePlacementShape = z
	.object({
		id: idShapes.FurniturePlacement,
		position: simpleVector3Shape,
		rotation: simpleQuaternionShape,
		furnitureId: idShapes.Furniture,
	})
	.describe('Describes the placement and orientation of a single piece of furniture in a room.');
export type RoomFurniturePlacement = z.infer<typeof roomFurniturePlacementShape>;

export const roomLightPlacementShape = z
	.object({
		id: z.custom<PrefixedId<'lp'>>((v) => isPrefixedId(v, 'lp')),
		position: simpleVector3Shape,
	})
	.describe('Describes the placement of a single directional light in a room. Usually represents a ceiling light.');
export type RoomLightPlacement = z.infer<typeof roomLightPlacementShape>;

export const roomGlobalLightingShape = z
	.object({
		color: z.number(),
		intensity: z.number(),
	})
	.describe('Global lighting settings for a room, which are applied ambiently.');
export type RoomGlobalLighting = z.infer<typeof roomGlobalLightingShape>;

export const roomLayoutShape = z
	.object({
		id: z.custom<PrefixedId<'rl'>>((v) => isPrefixedId(v, 'rl')),
		furniture: z.record(idShapes.FurniturePlacement, roomFurniturePlacementShape),
		icon: z.string().optional(),
		name: z.string().optional(),
		type: z.string().optional(),
	})
	.describe('A room layout is a collection of furniture placements related to a particular room. A room may support multiple layouts which users can switch between.');
export type RoomLayout = z.infer<typeof roomLayoutShape>;
