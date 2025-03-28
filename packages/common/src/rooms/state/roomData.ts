import { z } from 'zod';
import { PrefixedId, isPrefixedId } from '../../ids.js';
import { simpleQuaternionShape, simpleVector3Shape } from './common.js';

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
