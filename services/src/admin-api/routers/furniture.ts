import { FurnitureModelQuality, isPrefixedId } from '@alef/common';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { wrapRpcData } from '../../helpers/wrapRpcData';
import { Env } from '../config/ctx';

export const furnitureRouter = new Hono<Env>()
	.get('/unprocessed', async (ctx) => {
		const furniture = await ctx.env.ADMIN_STORE.listUnprocessedFurniture();
		return ctx.json(wrapRpcData(furniture));
	})
	.post(
		'/',
		zValidator(
			'json',
			z.object({
				name: z.string(),
				attributes: z
					.array(
						z.object({
							key: z.string(),
							value: z.string(),
						})
					)
					.optional(),
				originalFileName: z.string().optional(),
			})
		),
		async (ctx) => {
			const input = ctx.req.valid('json');
			const furniture = await ctx.env.ADMIN_STORE.insertFurniture({
				name: input.name,
				attributes: input.attributes,
				originalFileName: input.originalFileName,
			});
			return ctx.json(furniture);
		}
	)
	.put(
		'/:id/model',
		zValidator(
			'param',
			z.object({
				id: z.custom((val) => isPrefixedId(val, 'f')),
			})
		),
		zValidator(
			'form',
			z.object({
				file: z.instanceof(File),
				quality: z.nativeEnum(FurnitureModelQuality),
				dimensionX: z.number().optional(),
				dimensionY: z.number().optional(),
				dimensionZ: z.number().optional(),
			})
		),
		async (ctx) => {
			const { id } = ctx.req.valid('param');
			const { file, quality, dimensionX, dimensionY, dimensionZ } = ctx.req.valid('form');
			const fileStream = file.stream();
			const dimensions = (dimensionX && dimensionY && dimensionZ && { x: dimensionX, y: dimensionY, z: dimensionZ }) || null;
			await ctx.env.ADMIN_STORE.uploadFurnitureModel(id, fileStream, quality, dimensions);
			return ctx.json({ ok: true });
		}
	)
	.put(
		'/:id/image',
		zValidator(
			'param',
			z.object({
				id: z.custom((val) => isPrefixedId(val, 'f')),
			})
		),
		zValidator(
			'form',
			z.object({
				file: z.instanceof(File),
			})
		),
		async (ctx) => {
			const { id } = ctx.req.valid('param');
			const { file } = ctx.req.valid('form');
			const fileStream = file.stream();
			await ctx.env.ADMIN_STORE.uploadFurnitureImage(id, fileStream);
			return ctx.json({ ok: true });
		}
	)
	.put(
		'/:id/dimensions',
		zValidator(
			'param',
			z.object({
				id: z.custom((val) => isPrefixedId(val, 'f')),
			})
		),
		zValidator(
			'json',
			z.object({
				x: z.number().optional(),
				y: z.number().optional(),
				z: z.number().optional(),
			})
		),
		async (ctx) => {
			const { id } = ctx.req.valid('param');
			const { x, y, z } = ctx.req.valid('json');
			await ctx.env.ADMIN_STORE.updateFurniture(id, {
				measuredDimensionsX: x,
				measuredDimensionsY: y,
				measuredDimensionsZ: z,
			});
			return ctx.json({ ok: true });
		}
	)
	.put(
		'/:id',
		zValidator(
			'json',
			z.object({
				name: z.string().optional(),
				isPublic: z.boolean().optional(),
			})
		),
		zValidator(
			'param',
			z.object({
				id: z.custom((val) => isPrefixedId(val, 'f')),
			})
		),
		async (ctx) => {
			const { id } = ctx.req.valid('param');
			const { name, isPublic } = ctx.req.valid('json');
			await ctx.env.ADMIN_STORE.updateFurniture(id, { name, madePublicAt: isPublic ? new Date() : null });
			return ctx.json({ ok: true });
		}
	)
	.put(
		'/:id/attribute',
		zValidator(
			'param',
			z.object({
				id: z.custom((val) => isPrefixedId(val, 'f')),
			})
		),
		zValidator('json', z.object({ key: z.string(), value: z.string() })),
		async (ctx) => {
			const { id } = ctx.req.valid('param');
			const { key, value } = ctx.req.valid('json');
			await ctx.env.ADMIN_STORE.addFurnitureAttribute(id, key, value);
			return ctx.json({ ok: true });
		}
	)
	.delete(
		'/:id/attribute',
		zValidator(
			'param',
			z.object({
				id: z.custom((val) => isPrefixedId(val, 'f')),
			})
		),
		zValidator('json', z.object({ key: z.string(), value: z.string() })),
		async (ctx) => {
			const { id } = ctx.req.valid('param');
			const { key, value } = ctx.req.valid('json');
			await ctx.env.ADMIN_STORE.deleteFurnitureAttribute(id, key, value);
			return ctx.json({ ok: true });
		}
	)
	.delete(
		'/:id',
		zValidator(
			'param',
			z.object({
				id: z.custom((val) => isPrefixedId(val, 'f')),
			})
		),
		async (ctx) => {
			const { id } = ctx.req.valid('param');
			await ctx.env.ADMIN_STORE.deleteFurniture(id);
			return ctx.json({ ok: true });
		}
	);
