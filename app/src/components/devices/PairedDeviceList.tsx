import { useDeleteDevice, useDevices } from '@/services/publicApi/deviceHooks';
import { Box, Button, Card, Heading, Icon, Text } from '@alef/sys';

export function PairedDeviceList() {
	const { data: devices } = useDevices();
	const { mutate: deleteDevice, isPending } = useDeleteDevice();

	return (
		<Box stacked gapped>
			<Heading level={3}>Paired devices</Heading>
			<Card.Grid>
				{devices.map((device) => (
					<Card key={device.id}>
						<Card.Details justify="between">
							<Box gapped>
								<Card.Title>{device.name}</Card.Title>
								{device.isSelf && <Text>(this device)</Text>}
							</Box>
							<Button disabled={device.isSelf} color="destructive" loading={isPending} onClick={() => deleteDevice(device.id)}>
								<Icon name="trash" />
							</Button>
						</Card.Details>
					</Card>
				))}
			</Card.Grid>
		</Box>
	);
}
