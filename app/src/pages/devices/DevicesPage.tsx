import { NonHeadsetDeviceDiscovery } from '@/components/devices/NonHeadsetDeviceDiscovery';
import { PairedDeviceList } from '@/components/devices/PairedDeviceList';
import { Box } from '@alef/sys';

export function DevicesPage() {
	return (
		<Box full stacked gapped separated>
			<NonHeadsetDeviceDiscovery />
			<PairedDeviceList />
		</Box>
	);
}

export default DevicesPage;
