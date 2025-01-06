import type { AppType } from '@alef/services/public-api';

import { hc } from 'hono/client';
import { fetch } from './fetch.js';

export const publicApiClient = hc<AppType>(import.meta.env.VITE_PUBLIC_API_ORIGIN, {
	fetch,
});
