import { z } from 'zod';
import { isPrefixedId, PrefixedId } from '../../ids.js';

export const editorStateShape = z.object({
	selectedLayoutId: z.custom<PrefixedId<'rl'> | null>((v) => v === null || isPrefixedId(v, 'rl')),
	selectedObjectId: z.custom<PrefixedId<'fp'> | PrefixedId<'lp'> | null>((v) => v === null || isPrefixedId(v, 'fp') || isPrefixedId(v, 'lp')),
	placingFurnitureId: z.custom<PrefixedId<'f'> | null>((v) => v === null || isPrefixedId(v, 'f')),
});

export type EditorState = z.infer<typeof editorStateShape>;
