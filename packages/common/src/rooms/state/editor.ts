import { z } from 'zod';
import { isPrefixedId, PrefixedId } from '../../ids.js';

export const editorModeShape = z.union([z.literal('layouts'), z.literal('furniture'), z.literal('lighting'), z.literal('settings')]);
export type EditorMode = z.infer<typeof editorModeShape>;

export const editorStateShape = z.object({
	selectedLayoutId: z.custom<PrefixedId<'rl'> | null>((v) => v === null || isPrefixedId(v, 'rl')),
	selectedObjectId: z.custom<PrefixedId<'fp'> | PrefixedId<'lp'> | null>((v) => v === null || isPrefixedId(v, 'fp') || isPrefixedId(v, 'lp')),
	placingFurnitureId: z.custom<PrefixedId<'f'> | null>((v) => v === null || isPrefixedId(v, 'f')),
	mode: editorModeShape,
});

export type EditorState = z.infer<typeof editorStateShape>;
