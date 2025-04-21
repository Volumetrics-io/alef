import { Box, Button, Icon } from '@alef/sys';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PreviewController } from 'static-browser-server';
import { useAgentContext } from '../AgentContext';
import { ProjectFileBuilder } from './ProjectFileBuilder';

export interface CodeRendererProps {
	className?: string;
}

export function CodeRenderer({ className }: CodeRendererProps) {
	const { agent, state } = useAgentContext();
	const ref = useRef<HTMLIFrameElement>(null);

	const code = state.code;

	const reloadFrame = useCallback(() => {
		if (ref.current) {
			ref.current.src = ref.current.src;
		}
	}, []);

	const [error, setError] = useState<Error | null>(null);

	const [builder] = useState(
		() =>
			new ProjectFileBuilder({
				onUpdate: reloadFrame,
				onError: setError,
			})
	);

	const fixError = useCallback(() => {
		if (!builder.error) return;
		agent.call('generateCode', [
			`Fix the error in the last code:

		${builder.error.message}
		${builder.error.stack}`,
		]);
	}, [agent, builder]);

	const controller = useState(() => {
		return new PreviewController({
			baseUrl: 'https://preview.sandpack-static-server.codesandbox.io',
			getFileContent: builder.getFile.bind(builder),
		});
	})[0];

	const [src, setSrc] = useState<string | undefined>(undefined);
	useEffect(() => {
		controller
			.initPreview()
			.then((src) => setSrc(`${src}index.html`))
			.catch(console.error);
	}, [controller]);

	// update on code change
	useEffect(() => {
		builder.updateSource(code);
	}, [builder, code]);

	if (!code) {
		return (
			<Box full layout="center center" className={className}>
				Nothing yet
			</Box>
		);
	}

	return (
		<Box full className={className}>
			<Box asChild full>
				<iframe ref={ref} src={src} />
			</Box>
			{error && (
				<Button float="bottom-right" color="destructive" onClick={fixError}>
					<Icon name="bug" />
					Fix
				</Button>
			)}
		</Box>
	);
}
