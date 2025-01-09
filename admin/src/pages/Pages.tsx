import { Box } from '@alef/sys';
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
		path: '/users',
		component: lazy(() => import('./UsersPage.jsx')),
	},
	{
		path: '/furniture',
		component: lazy(() => import('./FurniturePage.jsx')),
	},
	{
		path: '*',
		component: lazy(() => import('./NotFoundPage.jsx')),
	},
]);

export const Pages = () => (
	<Router routes={routes}>
		<Box p full>
			<Outlet />
		</Box>
	</Router>
);
