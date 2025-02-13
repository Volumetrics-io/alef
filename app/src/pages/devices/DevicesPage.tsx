import { NonHeadsetDeviceDiscovery } from '@/components/devices/NonHeadsetDeviceDiscovery';
import { PairedDeviceList } from '@/components/devices/PairedDeviceList';
import { NavBar } from '@/components/NavBar';
import { Box, Main } from '@alef/sys';

export function DevicesPage() {
	return (
		<>
			<NavBar />
			<Main full p>
				<Box stacked gapped align="center">
					<NonHeadsetDeviceDiscovery />
					<PairedDeviceList />
				</Box>
			</Main>
		</>
	);
}

export default DevicesPage;
