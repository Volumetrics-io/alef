import { Frame, Heading, Box, Text, Dialog, Button } from '@alef/sys';
import { useClaimDevice, useDeviceDiscovery } from '@/services/publicApi/deviceHooks';
import { PrefixedId } from '@alef/common';
import toast from 'react-hot-toast';
import { os } from '@/services/os';
import { useMe } from '@/services/publicApi/userHooks';

export function DeviceDiscovery() {
	const { data: me } = useMe();
	const {
		data: { suggested },
	} = useDeviceDiscovery(`${me?.friendlyName}'s ${os} device`);

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
						<Frame color="secondary" p="small">
							Be sure to disable VPN / Private Relay on this device and your headset.
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

	return (
		<Dialog open>
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
