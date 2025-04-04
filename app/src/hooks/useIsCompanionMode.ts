import { useCurrentDevice } from '@/services/publicApi/deviceHooks';
import { useMe } from '@/services/publicApi/userHooks';
import { usePropertySocket } from '@/stores/propertyStore/hooks/property';
import { DeviceType, PrefixedId } from '@alef/common';
import { useEffect, useState } from 'react';

const COMPANION_DEVICE_TYPES = ['mobile', 'tablet'] as DeviceType[];

export function useIsCompanionMode() {
	const { data: self } = useMe();
	const { data: thisDevice } = useCurrentDevice();
	const myId = self?.id;
	const thisDeviceId = thisDevice?.id;
	const socket = usePropertySocket();
	const [companionDeviceId, setCompanionDeviceId] = useState<PrefixedId<'d'> | null>(() => {
		if (!myId) return null;
		return (
			socket?.peers
				.devicesByUser(myId)
				?.filter((device) => device.id !== thisDeviceId)
				.find((device) => COMPANION_DEVICE_TYPES.includes(device.type))?.id ?? null
		);
	});

	useEffect(() => {
		if (!socket) return;
		const unsubConnect = socket.onMessage('deviceConnected', ({ userId, device }) => {
			if (userId === myId && COMPANION_DEVICE_TYPES.includes(device.type) && device.id !== thisDeviceId) {
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
	}, [socket, myId, companionDeviceId, thisDeviceId]);

	return companionDeviceId !== null;
}
