import { hcWithType } from '@alef/services/public-api';
import type { InferResponseType } from 'hono';
import { fetch } from './fetch.js';

export const publicApiClient = hcWithType(import.meta.env.VITE_PUBLIC_API_ORIGIN, {
	fetch,
});

export type FurnitureData = InferResponseType<(typeof publicApiClient)['furniture']['$get']>[number];
