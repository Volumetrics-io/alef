import { z } from 'zod';
import { isPrefixedId, PrefixedId } from '../../ids.js';
import { editorModeShape } from '../state/editor.js';
import { baseRoomOperationShape } from './common.js';

export const selectLayoutOperationShape = baseRoomOperationShape.extend({
	type: z.literal('selectLayout'),
	layoutId: z.custom<PrefixedId<'rl'>>((v) => isPrefixedId(v, 'rl')),
});
export type SelectLayoutOperation = z.infer<typeof selectLayoutOperationShape>;

export const selectObjectShape = baseRoomOperationShape.extend({
	type: z.literal('selectObject'),
	objectId: z.custom<PrefixedId<'fp'> | PrefixedId<'lp'> | null>((v) => v === null || isPrefixedId(v, 'fp') || isPrefixedId(v, 'lp')),
});
export type SelectFurniturePlacementOperation = z.infer<typeof selectObjectShape>;

export const setPlacingFurnitureOperationShape = baseRoomOperationShape.extend({
	type: z.literal('setPlacingFurniture'),
	furnitureId: z.custom<PrefixedId<'f'> | null>((v) => v === null || isPrefixedId(v, 'f')),
});
export type SetPlacingFurnitureOperation = z.infer<typeof setPlacingFurnitureOperationShape>;

export const setEditorModeOperationShape = baseRoomOperationShape.extend({
	type: z.literal('setEditorMode'),
	mode: editorModeShape,
});
export type SetEditorModeOperation = z.infer<typeof setEditorModeOperationShape>;

export const editorOperationShape = z.union([selectLayoutOperationShape, selectObjectShape, setPlacingFurnitureOperationShape, setEditorModeOperationShape]);
export type EditorOperation = z.infer<typeof editorOperationShape>;
export type EditorOperationType = EditorOperation['type'];
export type EditorOperationByType<T extends EditorOperationType> = Extract<EditorOperation, { type: T }>;
