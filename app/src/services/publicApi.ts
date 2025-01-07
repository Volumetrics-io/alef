import { hcWithType } from '@alef/services/public-api';

import { fetch } from './fetch.js';

export const publicApiClient = hcWithType(import.meta.env.VITE_PUBLIC_API_ORIGIN, {
	fetch,
});
