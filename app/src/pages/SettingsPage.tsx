import { SubscriptionProductSelector } from '@/components/subscription/SubscriptionProductSelector';
import { Box, Heading } from '@alef/sys';

const SettingsPage = () => {
	return (
		<Box full>
			<Box stacked gapped constrained>
				<Heading level={1}>Settings</Heading>
				<Heading level={2}>Your plan</Heading>
				<SubscriptionProductSelector showFree />
			</Box>
		</Box>
	);
};

export default SettingsPage;
