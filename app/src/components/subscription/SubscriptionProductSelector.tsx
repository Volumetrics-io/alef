import { useOrganization } from '@/services/publicApi/organizationHooks';
import { useCancelSubscription, useProducts } from '@/services/publicApi/subscriptionHooks';
import { Box, Button, Card, Heading, Text, Toolbar } from '@alef/sys';
import { useEffect, useRef } from 'react';

export interface SubscriptionProductSelectorProps {
	showFree?: boolean;
	returnTo?: string;
}

export function SubscriptionProductSelector({ showFree, returnTo }: SubscriptionProductSelectorProps) {
	const { data: products } = useProducts();
	const { data: organization, refetch } = useOrganization();
	const isPaidPlan = organization.hasExtendedAIAccess;

	// this is not particularly robust, but it works for now as we only have the one product.
	const planKeySelected = isPaidPlan ? 'premium' : 'free';

	const cancel = useCancelSubscription();

	const hasRefetched = useRef(false);
	// about 3 seconds after first render, refetch once. This handles
	// cases where we redirected from a purchase but need time for the server
	// to handle a webhook
	useEffect(() => {
		if (hasRefetched.current) return;
		hasRefetched.current = true;
		const timeout = setTimeout(() => {
			refetch();
		}, 3000);
		return () => clearTimeout(timeout);
	}, [refetch]);

	return (
		<Card.Grid>
			{showFree && (
				<Card>
					<Card.Main p>
						<ProductInfo name="Free" description="Daily AI usage limits. Suitable for tinkering or trying Alef out." price="Free" />
					</Card.Main>
					{planKeySelected !== 'free' && (
						<Card.Details>
							<Toolbar>
								<Button color="destructive" onClick={() => cancel.mutate()} loading={cancel.isPending}>
									Downgrade to Free
								</Button>
							</Toolbar>
						</Card.Details>
					)}
				</Card>
			)}
			{products.map((product) => {
				const price = product.default_price;
				if (!price || typeof price === 'string' || !price.lookup_key) {
					console.error('Invalid product price', product);
					return null;
				}
				return (
					<Card key={product.id} asChild>
						<form method="POST" action={`${import.meta.env.VITE_PUBLIC_API_ORIGIN}/stripe/checkout-session`}>
							<Card.Main p>
								<ProductInfo name={product.name} description={product.description} price={`$${(price!.unit_amount || 0) / 100} / ${price!.recurring?.interval}`} />
							</Card.Main>
							<input type="hidden" name="priceKey" value={price.lookup_key} />
							<input type="hidden" name="returnTo" value={returnTo ?? `${import.meta.env.BASE_URL}/settings`} />
							{planKeySelected !== 'premium' && (
								<Card.Details>
									<Toolbar>
										<Button color="suggested" type="submit">
											Upgrade
										</Button>
									</Toolbar>
								</Card.Details>
							)}
						</form>
					</Card>
				);
			})}
		</Card.Grid>
	);
}

function ProductInfo({ name, description, price }: { name: string; description: string | null; price: string }) {
	return (
		<Box stacked gapped>
			<Heading level={3}>{name}</Heading>
			{description && <Text>{description}</Text>}
			<Text>{price}</Text>
		</Box>
	);
}
