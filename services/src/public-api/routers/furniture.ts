import { AlefError, Attribute, FurnitureModelQuality, isPrefixedId } from '@alef/common';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { wrapRpcData } from '../../helpers/wrapRpcData';
import { sessions } from '../auth/session';
import { Env } from '../config/ctx';

const formattedAttrSchema = z.string().regex(/^[^:]+:[^:]+$/);

export const furnitureRouter = new Hono<Env>()
	.get(
		'/',
		zValidator(
			'query',
			z.object({
				attribute: z.union([formattedAttrSchema, formattedAttrSchema.array()]).optional(),
				page: z.coerce.number().optional(),
				pageSize: z.coerce.number().optional(),
			})
		),
		async (ctx) => {
			const session = await sessions.getSession(ctx);
			const showNonPublic = !!session && session.isProductAdmin;

			// not using validated version here because .queries gives the coerced array version,
			// easier to work with...
			const attribute = ctx.req.queries('attribute') || [];
			const { page, pageSize } = ctx.req.valid('query');
			const keyValues = attribute.map((attr) => attr.split(':')).map(([key, value]) => ({ key, value }) as Attribute);

			// we only allow fetching a larger page size than 20 if the attribute filter
			// is the core package --- this is a special query used to preload and cache
			// core furniture data for offline use.
			if (pageSize && pageSize > 20 && !keyValues.every((attr) => attr.key === 'package' && attr.value === 'core')) {
				throw new AlefError(AlefError.Code.BadRequest, 'Page size too large');
			}

			if (page !== undefined && page < 0) {
				throw new AlefError(AlefError.Code.BadRequest, 'Invalid page number. Pages start at 0.');
			}

			const furniture = await ctx.env.PUBLIC_STORE.listFurniture({
				attributeFilters: keyValues,
				page,
				pageSize: pageSize || 10,
				includeNonPublic: showNonPublic,
			});
			return ctx.json(wrapRpcData(furniture));
		}
	)
	.get('/attributes', async (ctx) => {
		return ctx.json(wrapRpcData(await ctx.env.PUBLIC_STORE.listAttributes()));
	})
	.get(
		'/attributes/:key',
		zValidator(
			'param',
			z.object({
				key: z.string(),
			})
		),
		async (ctx) => {
			const key = ctx.req.valid('param').key;
			return ctx.json(wrapRpcData(await ctx.env.PUBLIC_STORE.getAttributeValues(key)));
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
			const session = await sessions.getSession(ctx);
			const showNonPublic = !!session && session.isProductAdmin;

			const furniture = await ctx.env.PUBLIC_STORE.getFurniture(ctx.req.valid('param').id, {
				includeNonPublic: showNonPublic,
			});
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
		zValidator(
			'query',
			z.object({
				quality: z.nativeEnum(FurnitureModelQuality).optional(),
			})
		),
		async (ctx) => {
			const quality = ctx.req.valid('query').quality || FurnitureModelQuality.Original;
			const data = await ctx.env.PUBLIC_STORE.getFurnitureModelResponse(ctx.req.valid('param').id, quality);
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
