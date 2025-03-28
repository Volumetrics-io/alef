import { usePropertySocket } from '@/services/publicApi/PropertySocketProvider';
import { useMe } from '@/services/publicApi/userHooks';
import { PrefixedId } from '@alef/common';
import { useEffect, useState } from 'react';

export function useIsHeadsetConnected() {
	const { data: self } = useMe();
	const myId = self?.id;
	const socket = usePropertySocket();
	const [headsetDeviceId, setHeadsetDeviceId] = useState<PrefixedId<'d'> | null>(() => {
		if (!myId) return null;
		return socket?.peers.devicesByUser(myId)?.find((device) => device.type === 'headset')?.id ?? null;
	});

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

	return headsetDeviceId !== null;
}
