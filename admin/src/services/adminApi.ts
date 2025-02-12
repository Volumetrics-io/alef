import { hcWithType } from '@alef/services/admin-api';
import { fetch } from './fetch.js';

export const adminApiClient = hcWithType(import.meta.env.VITE_ADMIN_API_ORIGIN, {
	fetch,
});
