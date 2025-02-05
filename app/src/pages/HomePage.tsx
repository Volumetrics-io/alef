import { ErrorBoundary, Main } from '@alef/sys';

import { NavBar } from '@/components/NavBar';
// import SunLight from '@/components/xr/lighting/SunLight.tsx';
import { useGeoStore } from '@/stores/geoStore.ts';
import { xrStore } from '@/stores/xrStore.ts';

import { MainScene } from '@/components/xr/MainScene';
import { isHeadset } from '@/services/os';
import { useMe } from '@/services/publicApi/userHooks';
import { RoomStoreProvider } from '@/stores/roomStore';
import { useNavigate } from '@verdant-web/react-router';
import { useEffect } from 'react';

const HomePage = () => {
	const geoStore = useGeoStore();
	const { data: session } = useMe();
	const navigate = useNavigate();
	const incompleteProfile = session && !session.emailVerifiedAt;
	useEffect(() => {
		// don't bother people on headsets with this
		if (!isHeadset && incompleteProfile) {
			navigate('/complete-signup');
		}
	}, [incompleteProfile, navigate]);

	return (
		<RoomStoreProvider>
			<NavBar style={{ position: 'fixed', top: '0' }} />
			<Main full style={{ height: '100vh' }}>
				<ErrorBoundary>
					<MainScene />
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
		</RoomStoreProvider>
	);
};

export default HomePage;
