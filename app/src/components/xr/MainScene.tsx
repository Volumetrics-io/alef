import { DepthShader } from '@/components/xr/shaders/DepthShader';
// import SunLight from '@/components/xr/lighting/SunLight.tsx';

import { useLocalStorage } from '@/hooks/useStorage';
import { useCurrentDevice } from '@/services/publicApi/deviceHooks';
import { useAllProperties, useProperty } from '@/services/publicApi/propertyHooks';
import { PropertySocketProvider } from '@/services/publicApi/PropertySocketProvider';
import { useMe } from '@/services/publicApi/userHooks';
import { RoomStoreProvider } from '@/stores/roomStore';
import { PrefixedId } from '@alef/common';
import { isDarkMode, setPreferredColorScheme } from '@react-three/uikit';
import { ReactNode } from 'react';
import { ModeProvider } from './modes/ModeContext';
import { StagerPanel } from './panels/StagerPanel';
import { ViewerPanel } from './panels/ViewerPanel';
import { RoomRenderer } from './room/RoomRenderer';
import { SceneWrapper } from './SceneWrapper';

export function MainScene() {
	const { data: session } = useMe();
	const isLoggedIn = !!session;
	const { data: selfDevice } = useCurrentDevice();

	const [theme, _] = useLocalStorage('theme', isDarkMode.value, false);

	setPreferredColorScheme(theme ? 'dark' : 'light');

	let sceneContent: ReactNode = null;
	// you can be logged in but not offline (cached /me response)
	if (!isLoggedIn) {
		// unauthenticated devices do not have access to Properties or the API, they run a single
		// room locally. Internally, we provide a Stager experience with an extra option to pair
		// a device with a user account.
		sceneContent = (
			<RoomStoreProvider roomId="r-local">
				<ModeProvider value="staging">
					<StagerPanel />
					<RoomRenderer />
				</ModeProvider>
			</RoomStoreProvider>
		);
	} else {
		const mode = selfDevice?.displayMode ?? 'staging';

		sceneContent = (
			<WrappedWithPropertyAndRoom>
				<ModeProvider value={mode}>
					{mode === 'staging' ? <StagerPanel /> : <ViewerPanel />}
					<RoomRenderer />
				</ModeProvider>
			</WrappedWithPropertyAndRoom>
		);
	}

	return (
		<SceneWrapper>
			<DepthShader />
			{sceneContent}
		</SceneWrapper>
	);
}

export default MainScene;

// this is a bit cumbersome, but this wrapper component provides the property and room
// state to the main app XR experience. it has to be separated to this component because
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
