import { Box } from '@alef/sys';
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
		path: '/users',
		component: lazy(() => import('./UsersPage.js')),
	},
	{
		path: '/furniture',
		component: lazy(() => import('./FurniturePage.js')),
	},
	{
		path: '*',
		component: lazy(() => import('./NotFoundPage.js')),
	},
]);

export const Pages = () => (
	<Router routes={routes}>
		<Box p full>
			<Outlet />
		</Box>
	</Router>
);
