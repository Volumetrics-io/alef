import { z } from 'zod';
import { isPrefixedId, PrefixedId } from '../../ids.js';

export const baseRoomOperationShape = z.object({
	opId: z.custom<PrefixedId<'op'>>((v) => isPrefixedId(v, 'op')),
	roomId: z.custom<PrefixedId<'r'>>((v) => isPrefixedId(v, 'r')),
});
