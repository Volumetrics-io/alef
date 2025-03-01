import { isQuest } from '@/services/os';
import { useDeviceDiscovery, useDiscoverySuggest } from '@/services/publicApi/deviceHooks';
import { PrefixedId } from '@alef/common';
import { Container, Text } from '@react-three/uikit';
import { colors } from '../ui/theme';
import { HourglassIcon, X } from '@react-three/uikit-lucide';
import { useState } from 'react';
import { Surface } from '../ui/Surface';
import { Button } from '../ui/Button';
import { Dimmer } from '../ui/Dimmer';
import { Heading } from '../ui/Heading';
export function HeadsetLogin({ onCancel }: { onCancel?: () => void }) {
	// TODO: modify name from here
	const [name, _setName] = useState(() => {
		if (isQuest) {
			return 'Quest Headset';
		}
		return 'New Headset';
	});

	const {
		data: { all: devices },
	} = useDeviceDiscovery(name);
	const [selectedDeviceId, setSelectedDevice] = useState<string | null>(null);
	const selectedDevice = devices?.find((device) => device.id === selectedDeviceId);

	const { mutateAsync: suggest } = useDiscoverySuggest();
	const pairWithDevice = async (deviceId: PrefixedId<'d'>) => {
		await suggest(deviceId);
		setSelectedDevice(deviceId);
	};

	return (
		<Dimmer>
			<Surface flexDirection="column" flexWrap="no-wrap" maxWidth={400} height="100%" gap={10} padding={10}>
					<Heading level={3} alignSelf="center">
						Device Pairing
					</Heading>
				{selectedDevice ? <WaitingToPair selectedDevice={selectedDevice} onCancel={() => setSelectedDevice(null)} /> : <DeviceList onSelect={pairWithDevice} devices={devices} />}
				<Button onClick={onCancel}>
					<Text>Cancel</Text>
				</Button>
			</Surface>
		</Dimmer>
	);
}

function DeviceList({ devices, onSelect }: { devices: { id: PrefixedId<'d'>; name?: string }[]; onSelect: (id: PrefixedId<'d'>) => void }) {
	return (
		<Container flexDirection="column" flexGrow={1} flexShrink={0} gap={4}>
			<Text>Log into Alef on a phone or computer using the same Wifi network as this device, then select it here.</Text>
			<Container flexDirection="column" 
				gap={4} 
				flexGrow={1} 
				flexShrink={0} 
				overflow="scroll" 
				width="100%"
				scrollbarWidth={10}
				scrollbarColor={colors.ink}
				scrollbarBorderRadius={5}
				paddingRight={10}
				>
				{!devices?.length ? (
					<Text color={colors.faded}>No devices yet</Text>
				) : (
					devices.map((device) => (
						<Button key={device.id} onClick={() => onSelect(device.id)}>
							<Text>{device.name ?? 'Unknown device'}</Text>
						</Button>
					))
				)}
			</Container>
		</Container>
	);
}

function WaitingToPair({ selectedDevice, onCancel }: { selectedDevice: { id: PrefixedId<'d'>; name?: string }; onCancel?: () => void }) {
	return (
		<Container flexDirection={'column'} gap={4}>
			<HourglassIcon />
			<Text fontSize={8}>
				Waiting to pair with {selectedDevice.name ?? 'Unknown device'}
			</Text>
			<Text>Press "Pair" on your device when prompted.</Text>
			<Button onClick={onCancel}>
				<Text>Cancel</Text>
			</Button>
		</Container>
	);
}
