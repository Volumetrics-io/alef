// specifying full versions saves a ~200ms fetch to resolve
// the latest version from the registry
const THREE_VERSION = '0.175.0';
const REACT_VERSION = `19.1.0`;
const R3F_VERSION = '9.1.2';
const DREI_VERSION = '10.0.6';

const CDN = 'https://esm.sh';

const importMap = {
	// TODO: configurable framework versions per-app
	'@alef/framework/runtime': '/runtime.js',
	'~/': '/src/',
	three: `${CDN}/three@${THREE_VERSION}/build/three.module.js`,
	'three/src/': `${CDN}/three@${THREE_VERSION}/src/`,
	'three/examples/jsm/': `${CDN}/three@${THREE_VERSION}/examples/jsm/`,
	'three/addons/': `${CDN}/three@${THREE_VERSION}/examples/jsm/`,
	react: `${CDN}/react@${REACT_VERSION}`,
	'react/jsx-runtime': `${CDN}/react@${REACT_VERSION}/jsx-runtime.js`,
	'react/jsx-dev-runtime': `${CDN}/react@${REACT_VERSION}/jsx-dev-runtime.js`,
	'react-dom': `${CDN}/react-dom@${REACT_VERSION}`,
	'react-dom/client': `${CDN}/react-dom@${REACT_VERSION}/client.js`,
	'@react-three/fiber': `${CDN}/@react-three/fiber@${R3F_VERSION}?external=react,react-dom,three`,
	'@react-three/drei': `${CDN}/@react-three/drei@${DREI_VERSION}?external=three,react,react-dom,@react-three/fiber`,
};

export const getHtml = ({ importMap: extraImportMap = {} }: { importMap?: Record<string, string> } = {}) => `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Alef Project</title>
	<style>
		html, body {
			margin: 0;
			padding: 0;
			width: 100%;
			height: 100dvh;
			background-color: #000;
		}

		.alef-onscreen-controls {
			position: absolute;
			inset: 0;
			pointer-events: none;
		}
		.alef-onscreen-controls > div {
			position: absolute;
			pointer-events: all;
		}
		.alef-onscreen-button {
			background-color: rgba(255, 255, 255, 0.8);
			border: none;
			border-radius: 5px;
			padding: 10px;
			display: flex;
			justify-content: center;
			align-items: center;
		}
		.alef-onscreen-stick {
			background-color: rgba(255, 255, 255, 0.8);
			border-radius: 50%;
			width: 100px;
			height: 100px;
			position: relative;
		}
		.alef-onscreen-stick__thumb {
			background-color: rgba(0, 0, 0, 0.8);
			border-radius: 50%;
			width: 20px;
			height: 20px;
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%) translate(var(--x), var(--y));
			display: flex;
			justify-content: center;
			align-items: center;
		}
	</style>
	<script type="importmap">
		{
			"imports": ${JSON.stringify({ ...importMap, ...extraImportMap })}
		}
	</script>
</head>
<body>
	<script type="module" src="/main.js"></script>
</body>
</html>`;

export const getMainJs = (userSourceRoot = 'index.js') => `
import { mountApp } from '@alef/framework/runtime';
import { App } from '~/${userSourceRoot}';
mountApp(App);
`;

export const getFailurePage = (error: Error) => `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Alef Project</title>
	<style>
		body {
			font-family: Arial, sans-serif;
			background-color: rgb(255, 241, 241);
			color: #721c24;
			padding: 20px;
		}
		h1 {
			color: #721c24;
		}
		h2 {
			color: #6b1500;
		}
		pre {
			background-color: #ffe0e0;
			padding: 10px;
			border-radius: 5px;
			overflow-x: auto;
		}
	</style>
</head>
<body>
	<h1>App failed to compile.</h1>
	<h2>${error.message}</h2>
	<pre>${error.stack}</pre>
</body>
</html>`;
