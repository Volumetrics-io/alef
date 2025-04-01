import { ExpiringMap } from '@a-type/utils';
import { PrefixedId } from '@alef/common';
import { DurableObject } from 'cloudflare:workers';
import { Bindings } from '../config/ctx';

export class Paircodes extends DurableObject<Bindings> {
	#codesToDevices = new ExpiringMap<string, PrefixedId<'d'>>();
	#devicesToCodes = new ExpiringMap<PrefixedId<'d'>, string>();

	register(deviceId: PrefixedId<'d'>) {
		const existing = this.#devicesToCodes.get(deviceId);
		if (existing) {
			return existing;
		}
		const code = this.#generateCode();
		this.#codesToDevices.set(code, deviceId, ExpiringMap.inHours(1));
		this.#devicesToCodes.set(deviceId, code, ExpiringMap.inHours(1));
		return code;
	}

	claim(code: string) {
		const normalized = code.toUpperCase();
		const deviceId = this.#codesToDevices.get(normalized);
		if (deviceId) {
			this.#codesToDevices.delete(normalized);
			this.#devicesToCodes.delete(deviceId);
			return deviceId;
		}
		return null;
	}

	#generateCode(): string {
		// a random 5-character code
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		let code = '';
		for (let i = 0; i < 5; i++) {
			code += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		// avoid dupes
		if (this.#codesToDevices.has(code)) {
			return this.#generateCode();
		}
		return code;
	}
}
