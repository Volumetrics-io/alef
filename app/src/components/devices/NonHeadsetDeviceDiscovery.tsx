import { os } from '@/services/os';
import { useClaimDevice, useDeviceDiscovery } from '@/services/publicApi/deviceHooks';
import { useMe } from '@/services/publicApi/userHooks';
import { PrefixedId } from '@alef/common';
import { Box, Button, Dialog, Form, Heading, Text } from '@alef/sys';
import { startTransition, useState } from 'react';
import toast from 'react-hot-toast';

export function NonHeadsetDeviceDiscovery() {
	const { data: me } = useMe();
	const [name, setName] = useState(() => {
		return `${me?.friendlyName}'s ${os} device`;
	});
	const {
		data: { suggested },
	} = useDeviceDiscovery(name);

	const firstSuggested = suggested[0];

	return (
		<Box stacked gapped>
			<Heading level={3}>Pair a headset</Heading>
			<Form
				initialValues={{ name }}
				onSubmit={({ name }) => {
					startTransition(() => {
						setName(name);
					});
				}}
			>
				<Form.TextField name="name" label="This device" />
				<Form.Submit>Change name</Form.Submit>
			</Form>
			{firstSuggested && <SuggestedDevice device={firstSuggested} />}
			{!suggested && (
				<Box>
					<Text>Waiting for a pairing request. Open the app on your headset to get started.</Text>
				</Box>
			)}
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
	const { mutate } = useClaimDevice({
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
					onClick={() => mutate(device.id)}
				>
					Pair
				</Button>
			</Dialog.Content>
		</Dialog>
	);
}
