import { DepthShader } from '@/components/xr/shaders/DepthShader';
// import SunLight from '@/components/xr/lighting/SunLight.tsx';

import { PropertyRoomStoreProvider } from '@/components/core/PropertyRoomStoreProvider.js';
import { useColorTheme } from '@/hooks/useColorTheme';
import { useMode } from './modes/ModeContext';
import { StagerPanel } from './panels/StagerPanel';
import { ViewerPanel } from './panels/ViewerPanel';
import { RoomRenderer } from './room/RoomRenderer';
import { SceneWrapper } from './SceneWrapper';

export function MainScene() {
	useColorTheme();

	return (
		<SceneWrapper>
			<DepthShader />
			<PropertyRoomStoreProvider>
				<ModePanel />
				<RoomRenderer />
			</PropertyRoomStoreProvider>
		</SceneWrapper>
	);
}

export default MainScene;

function ModePanel() {
	const mode = useMode();
	return mode === 'staging' ? <StagerPanel /> : <ViewerPanel />;
}
