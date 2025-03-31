import { DeviceResponseData, useDeleteDevice, useDevices, useUpdateDevice } from '@/services/publicApi/deviceHooks';
import { Box, Button, Frame, Heading, Icon, Label, Switch, Text } from '@alef/sys';

export function PairedDeviceList() {
	const { data: devices } = useDevices();

	return (
		<Box stacked gapped align="center" full="width">
			<Heading level={2}>Paired devices</Heading>
			<Box stacked gapped full="width">
				{devices.map((device) => {
					if (device.isSelf) return null;
					return <PairedDeviceItem key={device.id} device={device} />;
				})}
			</Box>
		</Box>
	);
}

function PairedDeviceItem({ device }: { device: DeviceResponseData }) {
	const { mutate: deleteDevice, isPending: isDeletePending } = useDeleteDevice();
	const { mutate: updateDevice, isPending: isUpdatePending } = useUpdateDevice();
	const isPending = isDeletePending || isUpdatePending;

	return (
		<Frame full="width" padded stacked gapped align="center">
			<Box gapped>
				<Text>{device.name}</Text>
				{device.isSelf && <Text>(this device)</Text>}
			</Box>
			<Box gapped justify="between" full="width">
				<Label>
					Buyer Mode
					<Switch
						checked={device.displayMode === 'viewing'}
						disabled={isPending}
						onCheckedChange={(checked) => updateDevice({ deviceId: device.id, updates: { displayMode: checked ? 'viewing' : 'staging' } })}
					/>
				</Label>
				<Button disabled={device.isSelf} color="destructive" loading={isPending} onClick={() => deleteDevice(device.id)}>
					<Icon name="trash" />
				</Button>
			</Box>
		</Frame>
	);
}
