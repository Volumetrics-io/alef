import { z } from 'zod';
import { isPrefixedId, PrefixedId } from '../../ids.js';
import { baseRoomOperationShape } from './common.js';

export const selectLayoutOperationShape = baseRoomOperationShape.extend({
	type: z.literal('selectLayout'),
	layoutId: z.custom<PrefixedId<'rl'>>((v) => isPrefixedId(v, 'rl')),
});
export type SelectLayoutOperation = z.infer<typeof selectLayoutOperationShape>;

export const selectFurniturePlacementOperationShape = baseRoomOperationShape.extend({
	type: z.literal('selectFurniturePlacement'),
	furniturePlacementId: z.custom<PrefixedId<'fp'>>((v) => isPrefixedId(v, 'fp')),
});
export type SelectFurniturePlacementOperation = z.infer<typeof selectFurniturePlacementOperationShape>;

export const selectLightPlacementOperationShape = baseRoomOperationShape.extend({
	type: z.literal('selectLightPlacement'),
	lightPlacementId: z.custom<PrefixedId<'lp'>>((v) => isPrefixedId(v, 'lp')),
});
export type SelectLightPlacementOperation = z.infer<typeof selectLightPlacementOperationShape>;

export const beginPlaceFurnitureOperationShape = baseRoomOperationShape.extend({
	type: z.literal('beginPlaceFurniture'),
	furnitureId: z.custom<PrefixedId<'f'>>((v) => isPrefixedId(v, 'f')),
});
export type BeginPlaceFurnitureOperation = z.infer<typeof beginPlaceFurnitureOperationShape>;

export const editorOperationShape = z.union([
	selectLayoutOperationShape,
	selectFurniturePlacementOperationShape,
	selectLightPlacementOperationShape,
	beginPlaceFurnitureOperationShape,
]);
export type EditorOperation = z.infer<typeof editorOperationShape>;
export type EditorOperationType = EditorOperation['type'];
export type EditorOperationByType<T extends EditorOperationType> = Extract<EditorOperation, { type: T }>;
