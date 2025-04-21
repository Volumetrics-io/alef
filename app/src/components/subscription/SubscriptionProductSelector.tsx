import { useOrganization } from '@/services/publicApi/organizationHooks';
import { useCancelSubscription, useProducts } from '@/services/publicApi/subscriptionHooks';
import { Box, Button, Card, Heading, Text, Toolbar } from '@alef/sys';

export interface SubscriptionProductSelectorProps {
	showFree?: boolean;
}

export function SubscriptionProductSelector({ showFree }: SubscriptionProductSelectorProps) {
	const { data: products } = useProducts();
	const { data: organization } = useOrganization();
	const isPaidPlan = organization.hasExtendedAIAccess;

	// this is not particularly robust, but it works for now as we only have the one product.
	const planKeySelected = isPaidPlan ? 'premium' : 'free';

	const cancel = useCancelSubscription();

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
