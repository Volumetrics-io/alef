import react from '@vitejs/plugin-react-swc';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const baseUrl = loadEnv(mode, process.cwd(), '')?.BASE_URL || '/';
	return {
		plugins: [react()],
		resolve: {
			alias: {
				'@': '/src',
			},
		},
		base: baseUrl,
		server: {
			port: 4203,
		},
	};
});
