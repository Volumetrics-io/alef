import { Spinner } from '@alef/sys';
import { makeRoutes, Outlet, Router } from '@verdant-web/react-router';
import { lazy, Suspense } from 'react';
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
		path: '/devices',
		component: Outlet,
		children: [
			{
				index: true,
				component: lazy(() => import('./devices/DevicesPage.js')),
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
		<Suspense
			fallback={
				<Spinner
					style={{
						position: 'fixed',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
					}}
				/>
			}
		>
			<Outlet />
		</Suspense>
	</Router>
);
