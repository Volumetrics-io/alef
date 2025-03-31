import { DeviceResponseData, useDeleteDevice, useDevices, useUpdateDevice } from '@/services/publicApi/deviceHooks';
import { Box, Button, Card, Heading, Icon, Label, Switch, Text } from '@alef/sys';

export function PairedDeviceList() {
	const { data: devices } = useDevices();

	return (
		<Box stacked gapped full="width">
			<Heading level={3}>Paired devices</Heading>
			<Card.Grid>
				{devices.map((device) => (
					<PairedDeviceItem key={device.id} device={device} />
				))}
			</Card.Grid>
		</Box>
	);
}

function PairedDeviceItem({ device }: { device: DeviceResponseData }) {
	const { mutate: deleteDevice, isPending: isDeletePending } = useDeleteDevice();
	const { mutate: updateDevice, isPending: isUpdatePending } = useUpdateDevice();
	const isPending = isDeletePending || isUpdatePending;

	return (
		<Card key={device.id}>
			<Card.Main layout="center center">
				<Label>
					Read only
					<Switch
						checked={device.displayMode === 'viewing'}
						disabled={isPending}
						onCheckedChange={(checked) => updateDevice({ deviceId: device.id, updates: { displayMode: checked ? 'viewing' : 'staging' } })}
					/>
				</Label>
			</Card.Main>
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
	);
}
