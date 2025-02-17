import { AlefError, Attribute, isPrefixedId } from '@alef/common';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { wrapRpcData } from '../../helpers/wrapRpcData';
import { loggedInMiddleware } from '../../middleware/session';
import { Env } from '../config/ctx';

const formattedAttrSchema = z.string().regex(/^[^:]+:[^:]+$/);

export const furnitureRouter = new Hono<Env>()
	.get(
		'/',
		loggedInMiddleware,
		zValidator(
			'query',
			z.object({
				attribute: z.union([formattedAttrSchema, formattedAttrSchema.array()]).optional(),
			})
		),
		async (ctx) => {
			// not using validated version here because .queries gives the coerced array version,
			// easier to work with...
			const attribute = ctx.req.queries('attribute') || [];
			if (attribute.length) {
				const keyValues = attribute.map((attr) => attr.split(':')).map(([key, value]) => ({ key, value }) as Attribute);
				const filteredFurniture = await ctx.env.PUBLIC_STORE.listFurnitureByAttributes(keyValues);
				return ctx.json(wrapRpcData(filteredFurniture));
			}
			const furniture = await ctx.env.PUBLIC_STORE.listFurniture();
			return ctx.json(wrapRpcData(furniture));
		}
	)
	.get(
		'/:id',
		loggedInMiddleware,
		zValidator(
			'param',
			z.object({
				id: z.custom((val) => isPrefixedId(val, 'f')),
			})
		),
		async (ctx) => {
			const furniture = await ctx.env.PUBLIC_STORE.getFurniture(ctx.req.valid('param').id);
			if (!furniture) {
				throw new AlefError(AlefError.Code.NotFound, 'Furniture not found');
			}
			return ctx.json(wrapRpcData(furniture));
		}
	)
	.get(
		'/:id/model',
		zValidator(
			'param',
			z.object({
				id: z.custom((val) => isPrefixedId(val, 'f')),
			})
		),
		async (ctx) => {
			const data = await ctx.env.PUBLIC_STORE.getFurnitureModelResponse(ctx.req.valid('param').id);
			if (!data) {
				throw new AlefError(AlefError.Code.NotFound, 'Model not found');
			}
			return data as unknown as Response;
		}
	)
	.get(
		'/:id/image.jpg',
		zValidator(
			'param',
			z.object({
				id: z.custom((val) => isPrefixedId(val, 'f')),
			})
		),
		async (ctx) => {
			const data = await ctx.env.PUBLIC_STORE.getFurnitureImageResponse(ctx.req.valid('param').id);
			if (!data) {
				throw new AlefError(AlefError.Code.NotFound, 'Image not found');
			}
			return data as unknown as Response;
		}
	);
