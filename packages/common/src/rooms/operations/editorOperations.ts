import { z } from 'zod';
import { idShapes, isPrefixedId, PrefixedId } from '../../ids.js';
import { editorModeShape } from '../state/editor.js';
import { baseRoomOperationShape } from './common.js';

export const selectLayoutOperationShape = baseRoomOperationShape
	.extend({
		type: z.literal('selectLayout'),
		layoutId: idShapes.RoomLayout,
	})
	.describe('Switches between different room layouts.');
export type SelectLayoutOperation = z.infer<typeof selectLayoutOperationShape>;

export const selectObjectShape = baseRoomOperationShape
	.extend({
		type: z.literal('selectObject'),
		objectId: z
			.custom<PrefixedId<'fp'> | PrefixedId<'lp'> | null>((v) => v === null || isPrefixedId(v, 'fp') || isPrefixedId(v, 'lp'))
			.describe('The unique ID of an object to select, either a light or furniture placement.'),
	})
	.describe('Selects a particular object for editing.');
export type SelectFurniturePlacementOperation = z.infer<typeof selectObjectShape>;

export const setPlacingFurnitureOperationShape = baseRoomOperationShape
	.extend({
		type: z.literal('setPlacingFurniture'),
		furnitureId: z.custom<PrefixedId<'f'> | null>((v) => v === null || isPrefixedId(v, 'f')),
	})
	.describe('Chooses a piece of furniture to begin placing within the room.');
export type SetPlacingFurnitureOperation = z.infer<typeof setPlacingFurnitureOperationShape>;

export const setEditorModeOperationShape = baseRoomOperationShape
	.extend({
		type: z.literal('setEditorMode'),
		mode: editorModeShape,
	})
	.describe('Switches the editor mode.');
export type SetEditorModeOperation = z.infer<typeof setEditorModeOperationShape>;

export const editorOperationShape = z.union([selectLayoutOperationShape, selectObjectShape, setPlacingFurnitureOperationShape, setEditorModeOperationShape]);
export type EditorOperation = z.infer<typeof editorOperationShape>;
export type EditorOperationType = EditorOperation['type'];
export type EditorOperationByType<T extends EditorOperationType> = Extract<EditorOperation, { type: T }>;
