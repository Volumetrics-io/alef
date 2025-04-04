import { useCurrentDevice } from '@/services/publicApi/deviceHooks';
import { useAllProperties } from '@/services/publicApi/propertyHooks';
import { useMe } from '@/services/publicApi/userHooks';
import { PropertyStoreProvider } from '@/stores/propertyStore';
import { ReactNode, Suspense } from 'react';
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
			<PropertyStoreProvider propertyId={null}>
				<ModeProvider value="staging">{children}</ModeProvider>
			</PropertyStoreProvider>
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

	return (
		<Suspense>
			<PropertyStoreProvider propertyId={defaultProperty.id}>{children}</PropertyStoreProvider>
		</Suspense>
	);
}
