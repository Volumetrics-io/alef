import { DepthShader } from '@/components/xr/shaders/DepthShader';
// import SunLight from '@/components/xr/lighting/SunLight.tsx';

import { PropertyRoomStoreProvider } from '@/components/core/PropertyRoomStoreProvider.js';
import { useColorTheme } from '@/hooks/useColorTheme';
// import { useEditorStore } from '@/stores/editorStore';
import { AdaptiveEvents } from '@react-three/drei';
// import { useMode } from './modes/ModeContext';
import { StagerPanel } from './panels/StagerPanel';
// import { ViewerPanel } from './panels/ViewerPanel';
import { RoomRenderer } from './room/RoomRenderer';
import { SelectRoomBlocker } from './room/SelectRoomBlocker';
import { SceneWrapper } from './SceneWrapper';

export function MainScene() {
	useColorTheme();

	return (
		<SceneWrapper full style={{ height: '100vh' }}>
			<DepthShader />
			<AdaptiveEvents />
			<PropertyRoomStoreProvider>
				<SelectRoomBlocker>
					<RoomRenderer />
					{/* <ModePanel /> */}
				</SelectRoomBlocker>
				<StagerPanel />
			</PropertyRoomStoreProvider>
		</SceneWrapper>
	);
}

export default MainScene;

// function ModePanel() {
// 	const mode = useMode();
// 	const splashScreen = useEditorStore((s) => s.splashScreen);
// 	if (splashScreen) return null;
// 	return mode === 'staging' ? <StagerPanel /> : <ViewerPanel />;
// }
