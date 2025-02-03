import { PrefixedId } from '@alef/common';
import { DurableObject } from 'cloudflare:workers';
import { Bindings } from '../config/ctx';

export interface DeviceRegistration {
	id: PrefixedId<'d'>;
	description?: string;
}

export class DeviceDiscovery extends DurableObject<Bindings> {
	#devices = new Map<PrefixedId<'d'>, DeviceRegistration>();
	#suggestions = new Map<PrefixedId<'d'>, PrefixedId<'d'>[]>();

	constructor(ctx: DurableObjectState, env: Bindings) {
		super(ctx, env);
	}

	register(registration: DeviceRegistration) {
		this.#devices.set(registration.id, registration);
	}

	listAll(ownId: PrefixedId<'d'>) {
		const all = Array.from(this.#devices.values().filter((d) => d.id !== ownId));
		const suggested = (this.#suggestions.get(ownId) || []).map((id) => this.#devices.get(id)).filter((v) => v !== undefined);
		return {
			all,
			suggested,
		};
	}

	suggest(ownId: PrefixedId<'d'>, suggestedId: PrefixedId<'d'>) {
		const suggestedIds = new Set(this.#suggestions.get(ownId) ?? []);
		suggestedIds.add(ownId);
		this.#suggestions.set(suggestedId, Array.from(suggestedIds));
	}
}
