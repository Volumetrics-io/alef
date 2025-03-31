import { useClaimDevice, useCurrentDevice, useDeviceDiscovery, useUpdateDevice } from '@/services/publicApi/deviceHooks';
import { PrefixedId } from '@alef/common';
import { Box, Button, Dialog, Form, Frame, Heading, Text } from '@alef/sys';
import toast from 'react-hot-toast';

export function NonHeadsetDeviceDiscovery() {
	const {
		data: { suggested },
	} = useDeviceDiscovery();
	const { data: selfDevice } = useCurrentDevice();
	const updateDevice = useUpdateDevice();

	const firstSuggested = suggested[0];

	return (
		<Frame padded stacked gapped>
			<Heading level={3}>Pair a headset</Heading>
			<Form
				initialValues={{ name: selfDevice?.name || '' }}
				enableReinitialize
				onSubmit={async ({ name }) => {
					if (!selfDevice) return;
					await updateDevice.mutateAsync({ deviceId: selfDevice.id, updates: { name } });
				}}
			>
				<Form.TextField name="name" label="This device" />
				<Form.Submit disabled={!selfDevice}>Change name</Form.Submit>
			</Form>
			{firstSuggested && <SuggestedDevice device={firstSuggested} />}
			{!suggested.length && (
				<Box>
					<Text>Waiting for a pairing request. Keep this page open and launch the app on your headset to get started.</Text>
				</Box>
			)}
		</Frame>
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
