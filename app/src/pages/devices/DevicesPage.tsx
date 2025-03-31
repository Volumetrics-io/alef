import { NonHeadsetDeviceDiscovery } from '@/components/devices/NonHeadsetDeviceDiscovery';
import { PairedDeviceList } from '@/components/devices/PairedDeviceList';
import { NavBar } from '@/components/navBar/NavBar';
import { Box, Main } from '@alef/sys';

export function DevicesPage() {
	return (
		<Main>
			<NavBar />
			<Box stacked gapped align="center">
				<NonHeadsetDeviceDiscovery />
				<PairedDeviceList />
			</Box>
		</Main>
	);
}

export default DevicesPage;
