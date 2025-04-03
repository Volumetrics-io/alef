import { useMe } from '@/services/publicApi/userHooks';
import { usePropertySocket } from '@/stores/propertyStore/hooks/property';
import { PrefixedId } from '@alef/common';
import { useEffect, useState } from 'react';

export function useIsCompanionMode() {
	const { data: self } = useMe();
	const myId = self?.id;
	const socket = usePropertySocket();
	const [companionDeviceId, setCompanionDeviceId] = useState<PrefixedId<'d'> | null>(() => {
		if (!myId) return null;
		return socket?.peers.devicesByUser(myId)?.find((device) => device.type !== 'headset')?.id ?? null;
	});

	useEffect(() => {
		if (!socket) return;
		const unsubConnect = socket.onMessage('deviceConnected', ({ userId, device }) => {
			if (userId === myId && device.type !== 'headset') {
				setCompanionDeviceId(device.id);
			}
		});
		const unsubDisconnect = socket.onMessage('deviceDisconnected', ({ deviceId }) => {
			if (deviceId === companionDeviceId) {
				setCompanionDeviceId(null);
			}
		});

		return () => {
			unsubConnect();
			unsubDisconnect();
		};
	}, [socket, myId, companionDeviceId]);

	return companionDeviceId !== null;
}
