import { makeRoutes, Outlet, Router } from '@verdant-web/react-router';
import { lazy } from 'react';
import HomePage from './HomePage.jsx';

const routes = makeRoutes([
	{
		path: '/',
		index: true,
		component: HomePage,
	},
	{
		path: '/login',
		component: lazy(() => import('./LoginPage.jsx')),
	},
	{
		path: '/verify',
		component: lazy(() => import('./VerifyPage.jsx')),
	},
	{
		path: '/reset-password',
		component: lazy(() => import('./ResetPasswordPage.jsx')),
	},
	{
		path: '*',
		component: lazy(() => import('./NotFoundPage.jsx')),
	},
]);

export const Pages = () => (
	<Router routes={routes}>
		<Outlet />
	</Router>
);
