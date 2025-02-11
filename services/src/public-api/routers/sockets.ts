import { assertPrefixedId } from '@alef/common';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { verifySocketToken } from '../auth/socketTokens';
import { Env } from '../config/ctx';

export const socketRouter = new Hono<Env>().all(
	'/',
	zValidator(
		'query',
		z.object({
			token: z.string(),
		})
	),
	async (ctx) => {
		const { aud: propertyId } = await verifySocketToken(ctx.req.valid('query').token, ctx.env.SOCKET_TOKEN_SECRET);
		assertPrefixedId(propertyId, 'p');

		const state = ctx.env.PROPERTY.get(ctx.env.PROPERTY.idFromName(propertyId));
		return state.fetch(ctx.req.raw);
	}
);
