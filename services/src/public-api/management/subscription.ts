import { assert } from '@a-type/utils';
import { assertPrefixedId, PrefixedId } from '@alef/common';
import { Context } from 'hono';
import Stripe from 'stripe';
import { Bindings, CtxVars } from '../config/ctx.js';
import { DAILY_TOKEN_LIMIT } from '../constants/usageLimits.js';
import { email } from '../services/email.js';
import { stripeDateToDate } from '../services/stripe.js';

type EnvWithStripe = {
	Variables: CtxVars & { stripe: Stripe };
	Bindings: Bindings;
};

async function emailAllAdmins(organizationId: PrefixedId<'or'>, creator: (name: string) => { subject: string; text: string; html: string }, ctx: Context<EnvWithStripe>) {
	const admins = await ctx.env.ADMIN_STORE.getOrganizationAdmins(organizationId);

	if (admins.length > 0) {
		await Promise.all(
			admins.map((admin) =>
				email.sendCustomEmail(
					{
						to: admin.email,
						...creator(admin.friendlyName || admin.fullName!),
					},
					ctx as any
				)
			)
		);
	}
}

export async function handleTrialEnd(event: Stripe.CustomerSubscriptionTrialWillEndEvent, ctx: Context<EnvWithStripe>) {
	// notify org admins their trial is ending
	const organization = await ctx.env.ADMIN_STORE.getOrganizationBySubscription(event.data.object.id);
	if (!organization) {
		console.error(`No organization found for subscription ${event.data.object.id}`);
		return;
	}

	await emailAllAdmins(
		organization.id,
		(name) => ({
			subject: 'Your Alef trial is ending',
			text: `Hi ${name},\n\nYour Alef trial has ended. You will be charged for your first payment. You can manage (or cancel) your plan at ${ctx.env.UI_ORIGIN}/settings. Please contact support if you have any questions.\n\nThanks,\nThe Alef Team`,
			html: `<div>
          <p>Hi ${name},</p>
          <p>Your Alef trial has ended. You will be charged for your first payment. You can manage (or cancel) your plan at <a href="${ctx.env.UI_ORIGIN}/settings">${ctx.env.UI_ORIGIN}/settings</a>.</p>
          <p>Please contact support if you have any questions.</p>
          <p>Thanks,</p>
          <p>The Alef team</p>
          </div>`,
		}),
		ctx
	);
}

export async function handleSubscriptionDeleted(event: Stripe.CustomerSubscriptionDeletedEvent, ctx: Context<EnvWithStripe>) {
	const subscription = event.data.object;

	const organization = await ctx.env.ADMIN_STORE.getOrganizationBySubscription(subscription.id);
	if (!organization) {
		console.error(`No organization found for subscription ${subscription.id}`);
		return;
	}

	await onSubscriptionEnded({
		subscription,
		organizationId: organization.id,
		ctx,
	});
}

export async function handleSubscriptionCreated(event: Stripe.CustomerSubscriptionCreatedEvent, ctx: Context<EnvWithStripe>) {
	const subscription = event.data.object;
	// attach subscription and customer to the organization based on metadata
	// we added during checkout

	const metadata = subscription.metadata as {
		organizationId: string;
	};
	const organizationId = metadata.organizationId;
	assertPrefixedId(organizationId, 'or');
	const organization = await ctx.env.ADMIN_STORE.getOrganization(organizationId);

	if (!organization) {
		console.error(`No organization found for subscription ${subscription.id} based on metadata ${JSON.stringify(metadata)}`);
		return;
	}

	// update the organization with the subscription
	assert(typeof subscription.customer === 'string', 'customer is not a string');
	await ctx.env.ADMIN_STORE.updateOrganization(organization.id, {
		stripeSubscriptionId: subscription.id,
		stripeCustomerId: subscription.customer as string,
	});

	if (subscription.trial_end && subscription.status === 'trialing') {
		await emailAllAdmins(
			organization.id,
			(name) => ({
				subject: 'Your Alef free trial has started!',
				text: `Hi ${name},\n\nYour Alef free trial has started! You can manage (or cancel) your plan at ${ctx.env.UI_ORIGIN}/settings. Please contact support if you have any questions.\n\nThanks,\nThe Alef Team`,
				html: `<div>
      <h1>Your Alef free trial has started!</h1>
      <p>Hi ${name},</p>
      <p>Your Alef free trial has started! You can manage (or cancel) your plan at <a href="${ctx.env.UI_ORIGIN}/settings">${ctx.env.UI_ORIGIN}/settings</a>. You won't be charged until ${
				stripeDateToDate(subscription.trial_end)?.toDateString() ?? 'the end of the trial'
			}.</p>
      <p>Please contact support if you have any questions.</p>
      <p>Thanks,</p>
      <p>The Alef Team</p>
      </div>`,
			}),
			ctx
		);
	}

	const admins = await ctx.env.ADMIN_STORE.getOrganizationAdmins(organization.id);
	const adminEmails = admins.map((a) => a.email).join(', ');
	email
		.sendCustomEmail(
			{
				to: 'volumetricsowner@gmail.com',
				subject: 'Alef Subscription Created',
				text: `A new subscription was created for ${adminEmails}: https://dashboard.stripe.com/subscriptions/${subscription.id}`,
				html: `<p>A new subscription was created for ${adminEmails}: <a href="https://dashboard.stripe.com/subscriptions/${subscription.id}">Link</a></p>`,
			},
			ctx as any
		)
		.catch((error) => {
			console.error('Failed to send subscription creation email', error);
		});
}

export async function handleSubscriptionUpdated(event: Stripe.CustomerSubscriptionUpdatedEvent, ctx: Context<EnvWithStripe>) {
	const subscription = event.data.object;

	const canceledAt = subscription.canceled_at ? stripeDateToDate(subscription.canceled_at) : null;

	const organization = await ctx.env.ADMIN_STORE.getOrganizationBySubscription(subscription.id);

	if (!organization) {
		console.error(`No organization found for subscription ${subscription.id}`);
		return;
	}

	if (!!canceledAt) {
		await onSubscriptionEnded({
			subscription,
			organizationId: organization.id,
			ctx,
		});
	}
}

async function onSubscriptionEnded({ subscription, organizationId, ctx }: { subscription: Stripe.Subscription; organizationId: PrefixedId<'or'>; ctx: Context<EnvWithStripe> }) {
	const endsAt = stripeDateToDate(subscription.cancel_at)?.toDateString();
	// notify plan admins their subscription was cancelled
	await emailAllAdmins(
		organizationId,
		(name) => ({
			subject: 'Your Alef subscription was cancelled',
			text: `Hi ${name},\n\nYour Alef subscription was cancelled. Please contact support if you have any questions.\n\nThanks,\nThe Alef Team`,
			html: `<div>
					<p>Hi ${name},</p>
					<p>Your Alef subscription was cancelled. Your plan will remain active until ${
						endsAt ?? 'the end of the current billing period'
					}. Restart your subscription anytime at <a href="${ctx.env.UI_ORIGIN}/settings">${ctx.env.UI_ORIGIN}/settings</a>.</p>
					<p>Please contact support if you have any questions.</p>
					<p>Thanks,</p>
					<p>The Alef Team</p>
				</div>`,
		}),
		ctx
	);
	email
		.sendCustomEmail(
			{
				to: 'volumetricsowner@gmail.com',
				subject: 'Alef Subscription Cancelled',
				text: `A subscription was cancelled: https://dashboard.stripe.com/subscriptions/${subscription.id}`,
				html: `<p>A subscription was cancelled: <a href="https://dashboard.stripe.com/subscriptions/${subscription.id}">Link</a></p>`,
			},
			ctx as any
		)
		.catch((error) => {
			console.error('Failed to send subscription cancelled email', error);
		});
}

export async function handleEntitlementsUpdated(ev: Stripe.EntitlementsActiveEntitlementSummaryUpdatedEvent, ctx: Context<EnvWithStripe>) {
	// Entitlements tell us what features the associated org has access to based on subscription status.
	const customerId = ev.data.object.customer;
	const organization = await ctx.env.ADMIN_STORE.getOrganizationByCustomer(customerId);
	if (!organization) {
		console.error(`No organization found for customer ${customerId}`);
		return;
	}
	// update the organization's limits
	const entitlementMap = getEntitlementsAsMap(ev);
	await ctx.env.ADMIN_STORE.updateOrganization(organization.id, {
		hasExtendedAIAccess: !!entitlementMap.get(ENTITLEMENT_NAMES.EXTENDED_AI_ACCESS),
	});
	// apply limit to organization's token quota
	const quotaObject = ctx.env.TOKEN_QUOTA.get(ctx.env.TOKEN_QUOTA.idFromName(organization.id));
	const newLimit = entitlementMap.get(ENTITLEMENT_NAMES.EXTENDED_AI_ACCESS) ? DAILY_TOKEN_LIMIT.EXTENDED : DAILY_TOKEN_LIMIT.FREE;
	quotaObject.applyLimit(newLimit);
	console.info(`Entitlements updated for ${organization.id}: ${JSON.stringify(Object.fromEntries(entitlementMap.entries()), null, 2)}, new token limit: ${newLimit}`);
}

function getEntitlementsAsMap(entitlements: Stripe.EntitlementsActiveEntitlementSummaryUpdatedEvent) {
	const map = new Map<string, boolean>();
	for (const entitlement of entitlements.data.object.entitlements.data) {
		if (!entitlement.feature) {
			continue;
		}
		map.set(entitlement.lookup_key, true);
	}
	return map;
}

export const ENTITLEMENT_NAMES = {
	EXTENDED_AI_ACCESS: 'extended-ai-access',
};
