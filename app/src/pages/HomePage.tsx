import { Redirect } from '@/components/Redirect';
import { isHeadset } from '@/services/os';
import { useMe } from '@/services/publicApi/userHooks';
import { useNavigate } from '@verdant-web/react-router';
import { lazy, useEffect } from 'react';

const LazyMainScene = lazy(() => import('@/components/xr/MainScene'));

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
			// not logged in -- redirect to coming soon page until 2d is officially launched
			return <Redirect to="/coming-soon" />;
		}

		// devices page is default 2D UI homepage while properties isn't very useful
		// on 2D UI yets
		return <Redirect to="/devices" />;
	}

	return <LazyMainScene />;
};

export default HomePage;
