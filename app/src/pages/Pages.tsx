import { makeRoutes, Outlet, Router } from '@verdant-web/react-router';
import { lazy, Suspense } from 'react';
import HeadsetPage from './HeadsetPage.js';
import HomePage from './HomePage.js';

const routes = makeRoutes([
	{
		path: '/',
		index: true,
		component: HomePage,
	},
	{
		path: '/login',
		component: lazy(() => import('./LoginPage.js')),
	},
	{
		path: '/verify',
		component: lazy(() => import('./VerifyPage.js')),
	},
	{
		path: '/reset-password',
		component: lazy(() => import('./ResetPasswordPage.js')),
	},
	{
		path: '/complete-signup',
		component: lazy(() => import('./CompleteSignupPage.js')),
	},
	{
		path: '/coming-soon',
		component: lazy(() => import('./ComingSoonPage.js')),
	},
	{
		path: '/devices',
		component: Outlet,
		children: [
			{
				index: true,
				component: lazy(() => import('./DesktopModePage.js')),
			},
		],
	},
	{
		path: '/properties',
		component: Outlet,
		children: [
			{
				index: true,
				component: lazy(() => import('./PropertiesPage.js')),
			},
			{
				path: '/:propertyId',
				component: lazy(() => import('./PropertyPage.js')),
			},
		],
	},
	{
		path: '/headset',
		component: HeadsetPage,
	},
	{
		path: '/desktop',
		component: lazy(() => import('./DesktopModePage.js')),
	},
	{
		path: '*',
		component: lazy(() => import('./NotFoundPage.js')),
	},
]);

export const Pages = () => (
	<Router routes={routes}>
		<Suspense>
			<Outlet />
		</Suspense>
	</Router>
);
