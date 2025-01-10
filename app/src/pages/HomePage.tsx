import { publicApiClient } from '@/services/publicApi';
import { Main, Button, ButtonRoot } from '@alef/sys';
import { useSuspenseQuery } from '@tanstack/react-query';

import { Canvas } from '@react-three/fiber';
import { reversePainterSortStable } from '@pmndrs/uikit';
import { IfInSessionMode, noEvents, PointerEvents, XR } from '@react-three/xr';
import { ControlCenter } from '@/components/xr/ControlCenter.tsx';
import { xrStore } from '@/stores/xrStore.ts';
import { NavBar } from '@/components/NavBar';
import { Baby, Bed, LampDesk, Sofa } from '@react-three/uikit-lucide';
import { colors, Toggle } from '@react-three/uikit-default'
import { Bedroom } from '@/spaces/bedroom';
import { Environment } from '@/components/xr/Environment';
import { AxesHelper } from 'three';
import { Helper } from '@react-three/drei';
import { DepthShader } from '@/components/xr/DepthShader';

const HomePage = () => {
	// const {
	// 	data: { session },
	// } = useSuspenseQuery({
	// 	queryKey: ['me'],
	// 	queryFn: async () => {
	// 		const response = await publicApiClient.auth.session.$get();
	// 		return response.json();
	// 	},
	// });

	return (
		<>
			<NavBar />
			<Main full style={{ height: '100vh' }}>
				<Canvas
						events={noEvents}
					onCreated={(state) => {
						state.gl.setClearColor(0xefffff);
						state.gl.localClippingEnabled = true;
						state.gl.setTransparentSort(reversePainterSortStable);
					}}
					>
					<ambientLight intensity={0.4} color="#fff8f0" />
					<directionalLight
						position={[5, 5, 5]}
						intensity={0.7}
						color="#ffd9b3"
						castShadow
						shadow-mapSize-width={2048}
						shadow-mapSize-height={2048}
					/>
					<hemisphereLight
						intensity={0.3}
						groundColor="#d4c4b5"
						color="#fffaf0"
					/>

					<PointerEvents />
					<XR store={xrStore}>
						<DepthShader />
						<ControlCenter>
							<Toggle>
								<Bed color={colors.primary} />
							</Toggle>
							<Toggle>
								<LampDesk color={colors.primary} />
							</Toggle>
							<Toggle>
								<Baby color={colors.primary} />	
							</Toggle>
							{/* <Toggle>
								<Sofa color={colors.primary} />
							</Toggle> */}
						</ControlCenter>
						<Environment>
							<Bedroom />
						</Environment>
					</XR>
				</Canvas>
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
				onClick={() => xrStore.enterAR()}
				>
				Enter AR
				</button>
		</>
	);
};

export default HomePage;
