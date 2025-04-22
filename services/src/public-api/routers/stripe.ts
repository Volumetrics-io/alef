import { AlefError, assertPrefixedId, idShapes } from '@alef/common';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import Stripe from 'stripe';
import { z } from 'zod';
import { loggedInMiddleware } from '../../middleware/session.js';
import { sessions } from '../auth/session.js';
import { Bindings, CtxVars, Env } from '../config/ctx.js';
import { handleEntitlementsUpdated, handleSubscriptionCreated, handleSubscriptionDeleted, handleSubscriptionUpdated, handleTrialEnd } from '../management/subscription.js';
import { getStripe } from '../services/stripe.js';

export const stripeRouter = new Hono<Env>()
	.use<{
		Bindings: Bindings;
		Variables: CtxVars & {
			stripe: Stripe;
		};
	}>(async (ctx, next) => {
		ctx.set('stripe', getStripe(ctx.env));
		return next();
	})
	.post('/webhook', async (ctx) => {
		const stripe = ctx.get('stripe');
		const signature = ctx.req.header('stripe-signature')!;
		let event;
		try {
			event = await stripe.webhooks.constructEventAsync(await ctx.req.text(), signature, ctx.env.STRIPE_WEBHOOK_SECRET);
		} catch (err) {
			console.log(`⚠️  Webhook signature verification failed.`, err);
			throw new AlefError(AlefError.Code.BadRequest, 'Webhook signature verification failed', err);
		}

		try {
			switch (event.type) {
				case 'customer.subscription.trial_will_end':
					await handleTrialEnd(event, ctx);
					break;
				case 'customer.subscription.deleted':
					await handleSubscriptionDeleted(event, ctx);
					break;
				case 'customer.subscription.created':
					await handleSubscriptionCreated(event, ctx);
					break;
				case 'customer.subscription.updated':
					await handleSubscriptionUpdated(event, ctx);
					break;
				// using Stripe's automatic emails for these
				// case 'invoice.payment_failed':
				// 	await handleInvoicePaymentFailed(event, ctx);
				// 	break;
				// case 'invoice.payment_action_required':
				// 	await handleInvoicePaymentActionRequired(event, ctx);
				// 	break;
				case 'entitlements.active_entitlement_summary.updated':
					await handleEntitlementsUpdated(event, ctx);
					break;
			}

			return new Response('OK');
		} catch (err) {
			console.error('Error handling webhook event', err);
			throw new AlefError(AlefError.Code.InternalServerError, 'Error handling webhook event', err);
		}
	})
	.get('/products', async (ctx) => {
		const stripe = ctx.get('stripe');
		const products = await stripe.products.list({
			active: true,
			expand: ['data.default_price'],
		});
		return ctx.json(products.data || []);
	})
	.post('/cancel-subscription', loggedInMiddleware, async (ctx) => {
		const session = await sessions.getSession(ctx);
		if (!session) {
			throw new AlefError(AlefError.Code.Unauthorized, 'Unauthorized', 'No session found');
		}

		assertPrefixedId(session.userId, 'u');
		const organizationId = ctx.get('session').organizationId;
		if (!organizationId) {
			throw new AlefError(AlefError.Code.BadRequest, 'No organization ID found in session');
		}

		const organization = await ctx.env.ADMIN_STORE.getOrganization(organizationId);
		if (!organization) {
			throw new AlefError(AlefError.Code.BadRequest, 'Invalid organization. Please contact support.');
		}

		if (!(await ctx.env.ADMIN_STORE.getIsUserOrganizationAdmin(session.userId, organizationId))) {
			throw new AlefError(AlefError.Code.Unauthorized, 'You must be an organization admin to cancel subscriptions');
		}

		if (!organization.stripeSubscriptionId) {
			throw new AlefError(AlefError.Code.BadRequest, 'No stripe customer ID found for this organization. Are you subscribed to a paid product?');
		}

		const stripe = ctx.get('stripe');
		await stripe.subscriptions.cancel(organization.stripeSubscriptionId);

		return ctx.json({ success: true });
	})
	.post(
		'/checkout-session',
		loggedInMiddleware,
		zValidator(
			'form',
			z.object({
				priceKey: z.string(),
				returnTo: z.string().optional(),
			})
		),
		async (ctx) => {
			const organizationId = ctx.get('session').organizationId;
			if (!organizationId) {
				throw new AlefError(AlefError.Code.BadRequest, 'No organization ID found in session');
			}

			const body = ctx.req.valid('form');
			const priceKey = body.priceKey;

			const session = await sessions.getSession(ctx);
			if (!session) {
				throw new AlefError(AlefError.Code.Unauthorized, 'Unauthorized', 'No session found');
			}

			assertPrefixedId(session.userId, 'u');
			const isUserAdmin = await ctx.env.ADMIN_STORE.getIsUserOrganizationAdmin(session.userId, organizationId);

			if (!isUserAdmin) {
				throw new AlefError(AlefError.Code.Unauthorized, 'You must be an organization admin to purchase subscriptions');
			}

			const prices = await ctx.get('stripe').prices.list({
				lookup_keys: [priceKey],
				expand: ['data.product'],
			});

			const price = prices.data[0];

			if (!price) {
				throw new AlefError(AlefError.Code.BadRequest, 'Could not purchase subscription. Please contact support.');
			}

			const userInfo = await ctx.env.ADMIN_STORE.getUser(session.userId);
			if (!userInfo) {
				throw new AlefError(AlefError.Code.InternalServerError, 'Could not purchase membership. Please contact support.');
			}

			const returnTo = body.returnTo || `${ctx.env.UI_ORIGIN}/settings`;
			const checkout = await ctx.get('stripe').checkout.sessions.create({
				mode: 'subscription',
				payment_method_types: ['card'],
				line_items: [
					{
						price: price.id,
						quantity: 1,
					},
				],
				success_url: returnTo,
				cancel_url: returnTo,
				customer_email: userInfo.email,
				allow_promotion_codes: true,
				billing_address_collection: 'auto',
				subscription_data: {
					metadata: {
						organizationId,
					},
					trial_period_days: 14,
				},
			});

			if (!checkout.url) {
				throw new AlefError(AlefError.Code.InternalServerError, 'Could not create checkout session');
			}

			return new Response(null, {
				status: 302,
				headers: {
					Location: checkout.url,
				},
			});
		}
	)
	.post(
		'/portal-session',
		zValidator(
			'json',
			z.object({
				organizationId: idShapes.Organization,
			})
		),
		async (ctx) => {
			const session = await sessions.getSession(ctx);
			if (!session) {
				throw new AlefError(AlefError.Code.Unauthorized, 'Unauthorized', 'No session found');
			}

			const { organizationId } = ctx.req.valid('json');

			const organization = await ctx.env.ADMIN_STORE.getOrganization(organizationId);
			if (!organization) {
				throw new AlefError(AlefError.Code.BadRequest, 'Invalid organization. Please contact support.');
			}
			assertPrefixedId(session.userId, 'u');

			const userIsAdmin = await ctx.env.ADMIN_STORE.getIsUserOrganizationAdmin(session.userId, organizationId);
			if (!userIsAdmin) {
				throw new AlefError(
					AlefError.Code.BadRequest,
					`You are not analogous admin of this organization and cannot manage billing. Please contact an organization admin to update the subscription.`
				);
			}

			if (!organization.stripeCustomerId) {
				throw new AlefError(AlefError.Code.BadRequest, 'No stripe customer ID found for this organization. Are you subscribed to a paid product?');
			}

			const portal = await ctx.get('stripe').billingPortal.sessions.create({
				customer: organization.stripeCustomerId,
				return_url: `${ctx.env.UI_ORIGIN}/settings`,
			});

			if (!portal.url) {
				throw new AlefError(AlefError.Code.InternalServerError, 'Could not create billing portal session');
			}

			return new Response(null, {
				status: 302,
				headers: {
					Location: portal.url,
				},
			});
		}
	);
