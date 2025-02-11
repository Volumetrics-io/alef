import { isQuest } from '@/services/os';
import { useDeviceDiscovery, useDiscoverySuggest } from '@/services/publicApi/deviceHooks';
import { PrefixedId } from '@alef/common';
import { Container, Root, Text } from '@react-three/uikit';
import { Button, colors } from '@react-three/uikit-default';
import { HourglassIcon } from '@react-three/uikit-lucide';
import { useState } from 'react';
import { DraggableBodyAnchor } from '../anchors/DraggableBodyAnchor';
import { SceneWrapper } from '../SceneWrapper';
import { Surface } from '../ui/Surface';

export function HeadsetLogin() {
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
		<SceneWrapper>
			<DraggableBodyAnchor follow position={[0, -0.3, 0.5]} lockY distance={0.15}>
				<Root pixelSize={0.001} flexDirection="column" gap={10}>
					<Surface flexDirection="column" flexWrap="no-wrap" maxWidth={400} padding={8}>
						<Text fontSize={8} color={colors.foreground}>
							Pair this device
						</Text>
						{selectedDevice ? (
							<WaitingToPair selectedDevice={selectedDevice} onCancel={() => setSelectedDevice(null)} />
						) : (
							<DeviceList onSelect={pairWithDevice} devices={devices} />
						)}
					</Surface>
				</Root>
			</DraggableBodyAnchor>
		</SceneWrapper>
	);
}

function DeviceList({ devices, onSelect }: { devices: { id: PrefixedId<'d'>; name?: string }[]; onSelect: (id: PrefixedId<'d'>) => void }) {
	return (
		<Container flexDirection="column" gap={4}>
			<Text color={colors.foreground}>Log into Alef on a phone or computer using the same Wifi network as this device, then select it here.</Text>
			<Container flexDirection="column" gap={4} width="100%">
				{!devices?.length ? (
					<Text color={colors.mutedForeground}>No devices yet</Text>
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
			<HourglassIcon color={colors.foreground} />
			<Text fontSize={8} color={colors.foreground}>
				Waiting to pair with {selectedDevice.name ?? 'Unknown device'}
			</Text>
			<Text color={colors.foreground}>Press "Pair" on your device when prompted.</Text>
			<Button onClick={onCancel}>
				<Text>Cancel</Text>
			</Button>
		</Container>
	);
}
