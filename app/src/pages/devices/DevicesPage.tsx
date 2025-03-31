import { DeviceIDCard } from '@/components/devices/DeviceIDCard';
import { PairedDeviceList } from '@/components/devices/PairedDeviceList';
import { DeviceDiscovery } from '@/components/devices/DeviceDiscovery';
import { Box, Heading, ScrollArea } from '@alef/sys';

export function DevicesPage() {
	return (
		<ScrollArea>
			<Box stacked gapped align="center">
				<Heading level={3}>Device Management</Heading>
				<DeviceIDCard />
				<DeviceDiscovery />
				<PairedDeviceList />
			</Box>
		</ScrollArea>
	);
}

export default DevicesPage;
