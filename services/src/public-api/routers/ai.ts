import { AlefError, isPrefixedId, PrefixedId } from '@alef/common';
import { zValidator } from '@hono/zod-validator';
import { getAgentByName } from 'agents';
import { Hono } from 'hono';
import { z } from 'zod';
import { userStoreMiddleware } from '../../middleware/session';
import { Env } from '../config/ctx';

export const aiRouter = new Hono<Env>()
	.all(
		'/layout/:propertyId/*',
		userStoreMiddleware,
		zValidator(
			'param',
			z.object({
				propertyId: z.custom<PrefixedId<'p'>>((v) => isPrefixedId(v, 'p')),
			})
		),
		async (ctx) => {
			const { propertyId } = ctx.req.valid('param');
			// authorize user access to this property
			const hasProperty = await ctx.get('userStore').hasProperty(propertyId);
			if (!hasProperty) {
				throw new AlefError(AlefError.Code.NotFound, 'Property not found');
			}
			const agent = getAgentByName(ctx.env.LAYOUT_AGENT, propertyId);
			return (await agent).fetch(ctx.req.raw);
		}
	)
	.all(
		'/vibe-coder/:projectId/*',
		userStoreMiddleware,
		zValidator(
			'param',
			z.object({
				projectId: z.custom<PrefixedId<'p'>>((v) => isPrefixedId(v, 'p')),
			})
		),
		async (ctx) => {
			const { projectId } = ctx.req.valid('param');
			// authorize user access to this property
			const hasProject = await ctx.get('userStore').hasProperty(projectId);
			if (!hasProject) {
				throw new AlefError(AlefError.Code.NotFound, 'Project not found');
			}
			const agent = getAgentByName(ctx.env.VIBE_CODER_AGENT, projectId);
			return (await agent).fetch(ctx.req.raw);
		}
	);
