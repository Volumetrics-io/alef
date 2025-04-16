import { defineConfig } from 'tsup';

export default defineConfig({
	entry: {
		runtime: 'src/runtime/index.tsx',
	},
	outDir: 'dist-runtime',
	bundle: true,
	external: ['react', 'react-dom', 'three', '@react-three/fiber'],
	format: 'esm',
	splitting: false,
	clean: true,
	platform: 'browser',
	target: 'es2020',
	esbuildOptions(options, ctx) {
		options.keepNames = true;
		options.treeShaking = false;
	},
});
