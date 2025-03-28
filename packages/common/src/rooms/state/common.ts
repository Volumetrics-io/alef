import { z } from 'zod';

export const simpleVector3Shape = z.object({
	x: z.number().safe(),
	y: z.number().safe(),
	z: z.number().safe(),
});
export type SimpleVector3 = z.infer<typeof simpleVector3Shape>;

export const simpleQuaternionShape = z.object({
	x: z.number().safe(),
	y: z.number().safe(),
	z: z.number().safe(),
	w: z.number().safe(),
});
export type SimpleQuaternion = z.infer<typeof simpleQuaternionShape>;
