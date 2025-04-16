import * as esbuild from 'esbuild-wasm';
import esbuildWasmUrl from 'esbuild-wasm/esbuild.wasm?url';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const windowProxy = window as any as { esbuildInitializePromise?: Promise<void> };

// only ever do this once.
windowProxy.esbuildInitializePromise =
	windowProxy.esbuildInitializePromise ??
	esbuild.initialize({
		wasmURL: esbuildWasmUrl,
	});

/**
 * Abstracts all the transformation / wrapping / etc that is applied
 * to user source files to create the final project sources used
 * in the simulation.
 */
export class ProjectFileBuilder {
	async build(sourceCode: string, fileName: string) {
		await windowProxy.esbuildInitializePromise;
		const compiled = await esbuild.transform(sourceCode, {
			jsx: 'automatic',
			target: 'es2020',
			format: 'esm',
			keepNames: true,
			minify: false,
			loader: 'jsx',
			sourcemap: 'both',
			sourcefile: fileName,
		});

		// TODO: cleaner
		// rewrite any .jsx relative imports to .js
		compiled.code = compiled.code.replace(/\.jsx(['"])/g, '.js$1');

		const code = compiled.code;
		if (!code) {
			throw new Error('No code generated!');
		}
		return code;
	}
}

export const fileBuilder = new ProjectFileBuilder();
