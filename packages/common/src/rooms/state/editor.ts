import { z } from 'zod';
import { isPrefixedId, PrefixedId } from '../../ids.js';

export const editorModeShape = z
	.union([z.literal('layouts'), z.literal('furniture'), z.literal('lighting'), z.literal('settings')])
	.describe('Different modes the editor can be in when making changes to a room layout');
export type EditorMode = z.infer<typeof editorModeShape>;

export const editorStateShape = z
	.object({
		selectedLayoutId: z.custom<PrefixedId<'rl'> | null>((v) => v === null || isPrefixedId(v, 'rl')),
		selectedObjectId: z.custom<PrefixedId<'fp'> | PrefixedId<'lp'> | null>((v) => v === null || isPrefixedId(v, 'fp') || isPrefixedId(v, 'lp')),
		placingFurnitureId: z.custom<PrefixedId<'f'> | null>((v) => v === null || isPrefixedId(v, 'f')),
		mode: editorModeShape,
	})
	.describe('The state of the room layout editor, including user selections and mode.');

export type EditorState = z.infer<typeof editorStateShape>;

export const createDefaultEditorState = (): EditorState => ({
	selectedLayoutId: null,
	selectedObjectId: null,
	placingFurnitureId: null,
	mode: 'layouts',
});
