import { makeRoutes, Outlet, Router } from '@verdant-web/react-router';
import { lazy } from 'react';
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
		path: '*',
		component: lazy(() => import('./NotFoundPage.js')),
	},
]);

export const Pages = () => (
	<Router routes={routes}>
		<Outlet />
	</Router>
);
