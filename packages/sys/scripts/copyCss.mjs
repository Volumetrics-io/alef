import cpy from 'cpy';
import * as fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const layerCss = await fs.readFile(path.join(dirname, '../src/styles/layers.css'), 'utf8');

// we also inject layer ordering into every stylesheet
// just to be sure it's correctly applied.

const files = await cpy('src/**/*.css', 'dist', { parents: true });
for (const file of files) {
	// rewrite with layer ordering
	const css = await fs.readFile(file, 'utf8');
	await fs.writeFile(file, `${layerCss}\n${css}`, 'utf8');
}
