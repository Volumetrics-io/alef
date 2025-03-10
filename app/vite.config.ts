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
				description: 'One room, endless possibilities.',
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

				globIgnores: ['**/node_modules/**/*', '**/assets/icon-*.js'],
			},

			workbox: {
				sourcemap: true,
			},
		}),
	],
	build: {
		rollupOptions: {
			output: {
				chunkFileNames(chunkInfo) {
					// mark dynamically imported icon chunks with a filename prefix so they can be handled differently
					// by the PWA precache -- there are a lot of them.
					if (chunkInfo.moduleIds.some((id) => id.includes('lucide-react/dist/esm/icons/'))) {
						return 'assets/icon-[name]-[hash].js';
					}
					return 'assets/[name]-[hash].js';
				},
			},
		},
	},
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
			'/admin-ui': {
				target: 'http://localhost:4203',
				changeOrigin: true,
				ws: true,
			},
			'/admin-api': {
				target: 'http://localhost:4202',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/admin-api/, ''),
				ws: true,
			},
		},
	},
});
