import { AdminStore } from '../../db';

interface Bindings {
	ADMIN_STORE: Service<AdminStore>;
}

export interface Env {
	Bindings: Bindings;
}
