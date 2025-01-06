import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import type { FC } from 'hono/jsx';
import { jsxRenderer } from 'hono/jsx-renderer';
import { z } from 'zod';
import type { AdminStore } from '../../db/src/index.js';

interface Env {
	ADMIN_STORE: Service<AdminStore>;
}

const AdminPanel: FC = () => (
	<div>
		<h1>Admin Panel</h1>
		<p>Welcome to the Alef admin panel.</p>
		<form action="/create-user" method="post">
			<label>
				<span>Email:</span>
				<input type="text" name="email" />
			</label>
			<label>
				<span>Name:</span>
				<input type="text" name="name" />
			</label>
			<label>
				<span>Password:</span>
				<input type="password" name="password" />
			</label>
			<button type="submit">Create User</button>
		</form>
	</div>
);

const adminApp = new Hono<{ Bindings: Env }>()
	.use(
		jsxRenderer(({ children }) => {
			return (
				<html>
					<head>
						<title>Alef Admin</title>
					</head>
					<body>{children}</body>
				</html>
			);
		})
	)
	.get('/', async (ctx) => {
		return ctx.render(<AdminPanel />);
	})
	.post(
		'/create-user',
		zValidator(
			'form',
			z.object({
				email: z.string().email(),
				name: z.string(),
				password: z.string().min(8),
			})
		),
		async (ctx) => {
			const { email, name, password } = ctx.req.valid('form');
			const adminStore = ctx.env.ADMIN_STORE;
			await adminStore.insertUser({ email, fullName: name, plaintextPassword: password, emailVerifiedAt: null, friendlyName: name, imageUrl: null });
			return ctx.redirect('/');
		}
	);

export default adminApp;
