import { Redirect } from '@/components/Redirect';
import { isHeadset } from '@/services/os';
import { lazy } from 'react';

const LazyMainScene = lazy(() => import('@/components/xr/MainScene'));

const HomePage = () => {
	if (!isHeadset) {
		// on desktop/mobile, editor is the default page.
		return <Redirect to="/editor" />;
	}

	return <LazyMainScene />;
};

export default HomePage;
