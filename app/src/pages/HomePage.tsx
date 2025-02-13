// import SunLight from '@/components/xr/lighting/SunLight.tsx';

import { Redirect } from '@/components/Redirect';
import { MainScene } from '@/components/xr/MainScene';
import { isHeadset } from '@/services/os';
import { useMe } from '@/services/publicApi/userHooks';
import { useNavigate } from '@verdant-web/react-router';
import { useEffect } from 'react';

const HomePage = () => {
	const { data: session } = useMe();
	const navigate = useNavigate();
	const incompleteProfile = session && !session.emailVerifiedAt;
	useEffect(() => {
		// don't bother people on headsets with this
		if (!isHeadset && incompleteProfile) {
			navigate('/complete-signup');
		}
	}, [incompleteProfile, navigate]);

	if (!isHeadset) {
		if (!session) {
			// not logged in -- redirect to login
			return <Redirect to="/login" />;
		}

		// devices page is default 2D UI homepage while properties isn't very useful
		// on 2D UI yets
		return <Redirect to="/devices" />;
	}

	return <MainScene />;
};

export default HomePage;
