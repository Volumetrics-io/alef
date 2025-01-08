import { isPrefixedId } from '@alef/common';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { Env } from '../config/ctx';

export const furnitureRouter = new Hono<Env>()
	.get(
		'/',
		zValidator(
			'query',
			z.object({
				attribute: z.union([z.string(), z.string().array()]).optional(),
			})
		),
		async (ctx) => {
			const attribute = ctx.req.queries('attribute') || [];
			if (attribute.length) {
				const keyValues = Object.fromEntries(attribute.map((attr) => attr.split(':')));
				const filteredFurniture = await ctx.env.PUBLIC_STORE.listFurnitureByAttributes(keyValues);
				return ctx.json(filteredFurniture);
			}
			const furniture = await ctx.env.PUBLIC_STORE.listFurniture();
			return ctx.json(furniture);
		}
	)
	.get(
		'/:id',
		zValidator(
			'param',
			z.object({
				id: z.custom((val) => isPrefixedId(val, 'f')),
			})
		),
		async (ctx) => {
			const furniture = await ctx.env.PUBLIC_STORE.getFurniture(ctx.req.valid('param').id);
			return ctx.json(furniture);
		}
	);
