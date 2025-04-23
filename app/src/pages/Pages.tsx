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
		path: '/projects',
		component: Outlet,
		children: [
			{
				path: '',
				index: true,
				component: lazy(() => import('./ProjectsPage.js')),
			},
			{
				path: ':projectId',
				component: lazy(() => import('./ProjectPage.js')),
			},
		],
	},
	{
		path: '/settings',
		component: lazy(() => import('./SettingsPage.js')),
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
