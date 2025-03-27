import { usePropertySocket } from '@/services/publicApi/PropertySocketProvider';
import { useMe } from '@/services/publicApi/userHooks';
import { PrefixedId } from '@alef/common';
import { Frame } from '@alef/sys';
import { useEffect, useState } from 'react';

export interface HeadsetConnectedIndicatorProps {}

const FAKE_IT = true;

export function HeadsetConnectedIndicator({}: HeadsetConnectedIndicatorProps) {
	const { data: self } = useMe();
	const myId = self?.id;
	const [headsetDeviceId, setHeadsetDeviceId] = useState<PrefixedId<'d'> | null>(null);

	const socket = usePropertySocket();
	useEffect(() => {
		if (!socket) return;
		const unsubConnect = socket.onMessage('deviceConnected', ({ userId, device }) => {
			if (userId === myId && device.type === 'headset') {
				setHeadsetDeviceId(device.id);
			}
		});
		const unsubDisconnect = socket.onMessage('deviceDisconnected', ({ deviceId }) => {
			if (deviceId === headsetDeviceId) {
				setHeadsetDeviceId(null);
			}
		});

		return () => {
			unsubConnect();
			unsubDisconnect();
		};
	}, [socket, myId, headsetDeviceId]);

	const isHeadsetConnected = FAKE_IT || headsetDeviceId !== null;

	return (
		<Frame rounded p="squeeze" layout="center center" gapped>
			<div
				style={{
					width: '1rem',
					height: '1rem',
					borderRadius: '9999px',
					backgroundColor: isHeadsetConnected ? 'var(--happy-press)' : 'var(--yummy-press)',
				}}
			/>
			{isHeadsetConnected ? <span>Headset connected</span> : <span>No headset connected</span>}
		</Frame>
	);
}
