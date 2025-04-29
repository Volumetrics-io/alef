import { DurableObject } from 'cloudflare:workers';
import { addDays, isToday, startOfDay } from 'date-fns';
import { Bindings } from '../config/ctx';
import { DAILY_TOKEN_LIMIT } from '../constants/usageLimits';

interface TokenQuotaState {
	periodStart: number; // UTC Epoch
	usage: number; // total usage since periodStart
	limit: number; // daily limit
}

export class TokenQuota extends DurableObject<Bindings> {
	#dailyLimit = DAILY_TOKEN_LIMIT.FREE; // "fail closed" - if not initialized, assume free tier
	#dailyUsage = 0;
	#periodStart = 0; // UTC Epoch

	constructor(ctx: DurableObjectState, env: Bindings) {
		super(ctx, env);
		this.#loadState();
	}

	async #loadState() {
		const stored = await this.ctx.storage.get<TokenQuotaState>('state');
		if (stored) {
			const isUsageValid = isToday(stored.periodStart);
			if (isUsageValid) {
				this.#dailyLimit = stored.limit;
				this.#dailyUsage = stored.usage;
				this.#periodStart = stored.periodStart;
			} else {
				// reset usage since day has changed
				this.#dailyUsage = 0;
				this.#periodStart = startOfDay(new Date()).getTime();
				await this.#saveState();
			}
		} else {
			this.#periodStart = startOfDay(new Date()).getTime();
			this.#dailyUsage = 0;
			await this.#saveState();
		}
	}

	async #saveState() {
		await this.ctx.storage.put<TokenQuotaState>('state', {
			periodStart: this.#periodStart,
			usage: this.#dailyUsage,
			limit: this.#dailyLimit,
		});
	}

	applyLimit(limit: number) {
		this.#dailyLimit = limit;
		this.#saveState();
	}

	addUsage(amount: number, memo: string) {
		this.#dailyUsage += amount;
		this.#saveState();
		console.info(`TokenQuota: ${memo} - ${amount} tokens used (${this.#dailyUsage} total today). Daily limit: ${this.#dailyLimit}.`);
	}

	getDetails() {
		// good idea to check now if the period has expired, when it matters.
		// doing just in time checking here avoids the need for a cron job
		if (!isToday(this.#periodStart)) {
			// quota period has expired, reset usage
			this.#dailyUsage = 0;
			this.#periodStart = startOfDay(new Date()).getTime();
			this.#saveState();
			console.info('TokenQuota: Daily quota period has expired, resetting usage.');
		}

		return {
			periodStart: this.#periodStart,
			usage: this.#dailyUsage,
			limit: this.#dailyLimit,
			remaining: this.#dailyLimit - this.#dailyUsage,
			exceeded: this.#dailyUsage > this.#dailyLimit,
			resetsAt: addDays(new Date(this.#periodStart), 1).getTime(),
		};
	}
}
