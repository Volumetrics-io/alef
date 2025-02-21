import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		VitePWA({
			includeManifestIcons: true,
			strategies: 'injectManifest',
			srcDir: 'src',
			filename: 'serviceWorker.ts',
			manifest: {
				id: 'io.alef.app',
				name: 'Alef',
				short_name: 'Alef',
				description: 'Dynamic virtual staging for modern real estate',
				theme_color: '#000000',
				background_color: '#ffffff',
				scope: 'https://app.alef.io/',
				icons: [
					{
						src: '/icons/192.png',
						sizes: '192x192',
						type: 'image/png',
					},
					{
						src: '/icons/512.png',
						sizes: '512x512',
						type: 'image/png',
					},
				],
				categories: [],
				display: 'standalone',
				start_url: '/?directLaunch=true',
			},

			injectManifest: {
				// 10MB
				maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
			},

			workbox: {
				sourcemap: true,
			},
		}),
	],
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
