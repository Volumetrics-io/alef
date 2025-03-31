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
		// on desktop/mobile, editor is the default page.
		return <Redirect to="/editor" />;
	}

	return <LazyMainScene />;
};

export default HomePage;
