import { useCurrentDevice } from '@/services/publicApi/deviceHooks';
import { useAllProperties, useProperty } from '@/services/publicApi/propertyHooks';
import { PropertySocketProvider } from '@/services/publicApi/PropertySocketProvider';
import { useMe } from '@/services/publicApi/userHooks';
import { RoomStoreProvider } from '@/stores/roomStore';
import { PrefixedId } from '@alef/common';
import { ReactNode } from 'react';
import { ModeProvider } from '../xr/modes/ModeContext';

export interface PropertyRoomStoreProviderProps {
	children?: ReactNode;
}

export function PropertyRoomStoreProvider({ children }: PropertyRoomStoreProviderProps) {
	const { data: session } = useMe();
	const isLoggedIn = !!session;
	const { data: selfDevice } = useCurrentDevice();

	// you can be logged in but not offline (cached /me response)
	if (!isLoggedIn) {
		// unauthenticated devices do not have access to Properties or the API, they run a single
		// room locally. Internally, we provide a Stager experience with an extra option to pair
		// a device with a user account.
		return (
			<RoomStoreProvider roomId="r-local">
				<ModeProvider value="staging">\ {children}</ModeProvider>
			</RoomStoreProvider>
		);
	}

	const mode = selfDevice?.displayMode ?? 'staging';
	return (
		<WrappedWithPropertyAndRoom>
			<ModeProvider value={mode}>{children}</ModeProvider>
		</WrappedWithPropertyAndRoom>
	);
}
// this is a bit cumbersome, but this wrapper component provides the property and room
// state to the main app experience. it has to be separated to this component because
// the logged-out experience cannot fetch this data.
function WrappedWithPropertyAndRoom({ children }: { children: ReactNode }) {
	// determine which Property + Room to show
	const { data: properties } = useAllProperties();
	const defaultProperty = properties[0];

	// TODO: as the app evolves we will include actual property management and not
	// rely on these assumptions. the selected property will come from remote device
	// configuration from a phone or computer.
	if (!defaultProperty) {
		throw new Error(`Expected the server to provision a default property`);
	}

	const {
		data: { rooms },
	} = useProperty(defaultProperty.id);
	const defaultRoomId = Object.keys(rooms)[0] as PrefixedId<'r'>;

	if (!defaultRoomId) {
		throw new Error(`Expected the server to provision a default room`);
	}

	return (
		<PropertySocketProvider propertyId={defaultProperty.id}>
			<RoomStoreProvider roomId={defaultRoomId}>{children}</RoomStoreProvider>
		</PropertySocketProvider>
	);
}
