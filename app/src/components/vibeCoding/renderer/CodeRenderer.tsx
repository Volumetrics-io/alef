import { frameworkCodePromise } from '@/services/framework';
import { getHtml, getMainJs } from '@alef/framework';
import { Box } from '@alef/sys';
import { useEffect, useRef, useState } from 'react';
import { PreviewController } from 'static-browser-server';
import { useAgentContext } from '../AgentContext';
import { fileBuilder } from './ProjectFileBuilder';

export interface CodeRendererProps {
	className?: string;
}

export function CodeRenderer({ className }: CodeRendererProps) {
	const { state } = useAgentContext();

	const code = state.code;
	const codeRef = useRef(code);
	codeRef.current = code;

	const controller = useState(() => {
		return new PreviewController({
			baseUrl: 'https://preview.sandpack-static-server.codesandbox.io',
			getFileContent: async (filePath) => {
				if (filePath === '/index.html') {
					return getHtml({});
				}
				if (filePath === '/runtime.js') {
					return frameworkCodePromise;
				}
				if (filePath === '/main.js') {
					return getMainJs();
				}
				if (filePath !== '/src/index.js') {
					throw new Error('Only ~/index.js is supported');
				}
				try {
					const result = await fileBuilder.build(codeRef.current, 'index.js');
					console.log('~/index.js', result);
					return result;
				} catch (error) {
					console.error(error);
					const message = error instanceof Error ? error.message : String(error);
					return `export const App = () => <div>Failed to compile app: ${message}</div>;`;
				}
			},
		});
	})[0];

	const [src, setSrc] = useState<string | undefined>(undefined);
	useEffect(() => {
		controller
			.initPreview()
			.then((src) => setSrc(`${src}index.html`))
			.catch(console.error);
	}, [controller]);

	const ref = useRef<HTMLIFrameElement>(null);

	// reload frame on code change
	useEffect(() => {
		if (ref.current && src) {
			console.log('new code', code);
			ref.current.src = src;
		}
	}, [src, code]);

	if (!code) {
		return (
			<Box full layout="center center" className={className}>
				Nothing yet
			</Box>
		);
	}

	return (
		<Box asChild full className={className}>
			<iframe ref={ref} src={src} />
		</Box>
	);
}
