import { hcWithType } from '@alef/services/public-api';

import { publicApiOrigin } from '@/env.js';
import { fetch } from '../fetch.js';

export const publicApiClient = hcWithType(publicApiOrigin, {
	fetch,
});
