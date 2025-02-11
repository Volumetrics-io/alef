import { DepthShader } from '@/components/xr/shaders/DepthShader';
// import SunLight from '@/components/xr/lighting/SunLight.tsx';

import { useCurrentDevice } from '@/services/publicApi/deviceHooks';
import { Physics } from '@react-three/rapier';
import { StagingScene } from './modes/StagingScene';
import { ViewingScene } from './modes/ViewingScene';
import { SceneWrapper } from './SceneWrapper';

export function MainScene() {
	const { data: selfDevice } = useCurrentDevice();

	return (
		<SceneWrapper>
			<DepthShader />
			<Physics debug={location.search.includes('debug')}>{selfDevice?.displayMode === 'staging' ? <StagingScene /> : <ViewingScene />}</Physics>
		</SceneWrapper>
	);
}
