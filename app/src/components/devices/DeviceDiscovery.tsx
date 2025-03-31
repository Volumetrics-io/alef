import { useClaimDevice, useDeviceDiscovery } from '@/services/publicApi/deviceHooks';
import { PrefixedId } from '@alef/common';
import { Box, Button, Dialog, Frame, Heading, Icon, Text } from '@alef/sys';
import { useState } from 'react';
import toast from 'react-hot-toast';

export function DeviceDiscovery() {
	const {
		data: { suggested },
	} = useDeviceDiscovery();

	const firstSuggested = suggested[0];
	return (
		<Box stacked gapped align="center" full="width">
			<Heading level={3}>Connect a headset</Heading>
			<Box stacked p="small">
				<Text>To connect a headset to your account:</Text>
				<Box stacked p="small">
					<Text>1. Open alef in your headset</Text>
					<Text>2. Select "connect to account." in settings.</Text>
					<Text>3. Select this device from the device list.</Text>
					<Text>4. Approve the pairing request.</Text>
				</Box>
			</Box>
			<Frame full="width" p="small" gapped>
				{!suggested.length && (
					<Box stacked gapped align="center">
						<Text>Waiting for a pairing request.</Text>
						<Frame color="secondary" p="small" align="center" gapped>
							<Icon name="triangle-alert" />
							<Text>Be sure to disable VPN / Private Relay on this device and your headset.</Text>
						</Frame>
					</Box>
				)}
				{firstSuggested && <SuggestedDevice device={firstSuggested} />}
			</Frame>
		</Box>
	);
}
function SuggestedDevice({
	device,
}: {
	device: {
		id: PrefixedId<'d'>;
		name?: string;
	};
}) {
	const { mutateAsync } = useClaimDevice({
		onSuccess: () => {
			toast.success(`Paired with ${device.name}`);
		},
	});
	const [open, setOpen] = useState(true);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<Dialog.Content title={`Pair with ${device.name}`}>
				<Text tall>Tap "Pair" to associate this device with your account.</Text>
				<Button
					color="suggested"
					style={{
						fontSize: '2rem',
						padding: '1rem 2rem',
					}}
					onClick={async () => {
						await mutateAsync(device.id);
					}}
				>
					Pair
				</Button>
			</Dialog.Content>
		</Dialog>
	);
}
