// import SunLight from '@/components/xr/lighting/SunLight.tsx';

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

		// properties page is default 2D UI homepage
		return <Redirect to="/properties" />;
	}

	return <MainScene />;
};

export default HomePage;

function Redirect({ to }: { to: string }) {
	const navigate = useNavigate();
	useEffect(() => {
		navigate(to);
	}, [navigate, to]);
	return null;
}
