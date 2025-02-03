import { useDevices } from '@/services/publicApi/deviceHooks';
import { Box, Card, Heading, Text } from '@alef/sys';

export function PairedDeviceList() {
	const { data: devices } = useDevices();

	return (
		<Box stacked gapped>
			<Heading level={3}>Paired devices</Heading>
			<Card.Grid>
				{devices.map((device) => (
					<Card key={device.id}>
						<Card.Details>
							<Card.Title>{device.name}</Card.Title>
							{device.isSelf && <Text>(this device)</Text>}
						</Card.Details>
					</Card>
				))}
			</Card.Grid>
		</Box>
	);
}
