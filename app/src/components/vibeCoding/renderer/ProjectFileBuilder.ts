import { frameworkCodePromise } from '@/services/framework';
import { getFailurePage, getHtml, getMainJs } from '@alef/framework';
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
	#error: Error | null = null;
	#sourceCode: string | null = null;
	#cachedOutput: Promise<string> | null = null;

	#onUpdate: () => void;
	#onError: (err: Error) => void;

	constructor({ onUpdate, onError }: { onUpdate: () => void; onError: (err: Error) => void }) {
		this.#onUpdate = onUpdate;
		this.#onError = onError;
	}

	get error() {
		return this.#error;
	}

	updateSource = async (code: string) => {
		if (code === this.#sourceCode) return;
		this.#sourceCode = code;
		this.#error = null;
		this.#cachedOutput = this.#build();
		this.#cachedOutput
			.catch((err) => {
				this.#error = err as Error;
				this.#cachedOutput = null;
				this.#onError(err as Error);
			})
			.finally(() => {
				this.#onUpdate();
			});
	};

	getIndex() {
		if (this.error) {
			return getFailurePage(this.error);
		}
		return getHtml();
	}

	getRuntime() {
		return frameworkCodePromise;
	}

	getMain() {
		return getMainJs();
	}

	getSource() {
		return this.#cachedOutput || '';
	}

	getFile(filePath: string) {
		if (filePath === '/index.html') return this.getIndex();
		if (filePath === '/runtime.js') return this.getRuntime();
		if (filePath === '/main.js') return this.getMain();
		if (filePath === '/src/index.js') return this.getSource();
		throw new Error(`File not found: ${filePath}`);
	}

	async #build() {
		if (!this.#sourceCode) return '';

		await windowProxy.esbuildInitializePromise;
		const compiled = await esbuild.transform(this.#sourceCode, {
			jsx: 'automatic',
			target: 'es2020',
			format: 'esm',
			keepNames: true,
			minify: false,
			loader: 'jsx',
			sourcemap: 'both',
			sourcefile: 'index.js',
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
