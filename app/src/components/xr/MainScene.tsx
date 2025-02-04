import { DepthShader } from '@/components/xr/shaders/DepthShader';
// import SunLight from '@/components/xr/lighting/SunLight.tsx';
import { xrStore } from '@/stores/xrStore.ts';
import { reversePainterSortStable } from '@pmndrs/uikit';
import { Canvas } from '@react-three/fiber';
import { noEvents, PointerEvents, useXR, XR } from '@react-three/xr';

import { StagerPanel } from '@/components/xr/panels/StagerPanel';
import { RoomRenderer } from '@/components/xr/room/RoomRenderer';
import { useIsLoggedIn } from '@/services/publicApi/userHooks';
import { OrbitHandles } from '@react-three/handle';
import { Physics } from '@react-three/rapier';
import { PCFSoftShadowMap } from 'three';
import { HeadsetLogin } from './auth/HeadsetLogin';
import { XRToaster } from './XRToaster';

export function MainScene() {
	const isLoggedIn = useIsLoggedIn();

	return (
		<Canvas
			events={noEvents}
			onCreated={(state) => {
				state.gl.setClearColor(0xefffff);
				state.gl.localClippingEnabled = true;
				state.gl.setTransparentSort(reversePainterSortStable);
				state.gl.shadowMap.autoUpdate = false;
				state.gl.shadowMap.type = PCFSoftShadowMap;
			}}
			shadows={true}
			camera={{ position: [-0.5, 0.5, 0.5] }}
		>
			<XR store={xrStore}>
				<PointerEvents />

				{isLoggedIn ? <AppScene /> : <HeadsetLogin />}
				<DebugHandles />
				<XRToaster debug />
			</XR>
		</Canvas>
	);
}

function AppScene() {
	return (
		<>
			<DepthShader />
			<Physics debug>
				<StagerPanel />
				<RoomRenderer />
			</Physics>
		</>
	);
}

function DebugHandles() {
	const isInSession = useXR((s) => !!s.session);
	if (isInSession) return null;
	return <OrbitHandles damping />;
}
