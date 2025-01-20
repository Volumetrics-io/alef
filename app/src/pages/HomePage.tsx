import { ErrorBoundary, Main } from '@alef/sys';

import { NavBar } from '@/components/NavBar';
import { ControlCenter } from '@/components/xr/ControlCenter.tsx';
import { Environment } from '@/components/xr/Environment';
import { DepthShader } from '@/components/xr/shaders/DepthShader';
// import SunLight from '@/components/xr/lighting/SunLight.tsx';
import { useGeoStore } from '@/stores/geoStore.ts';
import { xrStore } from '@/stores/xrStore.ts';
import { reversePainterSortStable } from '@pmndrs/uikit';
import { Canvas } from '@react-three/fiber';
import { colors, Toggle } from '@react-three/uikit-default';
import { Baby, Bed, LampDesk } from '@react-three/uikit-lucide';
import { noEvents, PointerEvents, XR } from '@react-three/xr';

import { RoomRenderer } from '@/components/xr/room/RoomRenderer';
import { useMe } from '@/services/publicApi/userHooks';
import { RoomLighting } from '@/components/xr/lighting/RoomLighting';
import { PCFSoftShadowMap } from 'three';
import { useNavigate } from '@verdant-web/react-router';
import { useEffect } from 'react';
import { StagerPanel } from '@/components/xr/panels/StagerPanel';

const HomePage = () => {
	const geoStore = useGeoStore();
	const { data: session } = useMe();
	const navigate = useNavigate();
	useEffect(() => {
		if (!session?.emailVerifiedAt) {
			navigate('/complete-signup');
		}
	}, [session?.emailVerifiedAt, navigate]);
	return (
		<>
			{/* <NavBar /> */}
			<Main full style={{ height: '100vh' }}>
				<ErrorBoundary>
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
					>
						<PointerEvents />
						<XR store={xrStore}>
							<DepthShader />
							<StagerPanel />
							<Environment>
								<RoomLighting />
								{/* TODO: sun light needs refinement */}
								{/* <SunLight /> */}
								{/* <Bedroom /> */}
								{/* <RoomRenderer /> */}
							</Environment>
						</XR>
					</Canvas>
				</ErrorBoundary>
			</Main>
			<button
				style={{
					position: 'fixed',
					bottom: '0',
					left: '50%',
					transform: 'translateX(-50%)',
					background: 'black',
					borderRadius: '0.5rem',
					border: 'none',
					fontWeight: 'bold',
					color: 'white',
					padding: '1rem 2rem',
					cursor: 'pointer',
					fontSize: '1.5rem',
					boxShadow: '0px 0px 20px rgba(0,0,0,1)',
				}}
				onClick={() => {
					xrStore.enterAR();
					geoStore.fetchLocation();
				}}
				>
				Enter AR
			</button>
		</>
	);
};

export default HomePage;
