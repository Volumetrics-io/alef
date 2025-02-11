import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'@': '/src',
		},
		dedupe: ['@react-three/fiber', 'three'],
	},
	server: {
		port: 4200,
		proxy: {
			'/public-api': {
				target: 'http://localhost:4201',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/public-api/, ''),
				ws: true,
			},
		},
	},
});
