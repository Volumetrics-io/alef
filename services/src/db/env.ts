import type { AdminStore } from './adminStore.js';

export interface Env {
	D1: D1Database;
	STORE: Service<AdminStore>;
	FURNITURE_MODELS_BUCKET: R2Bucket;
}
