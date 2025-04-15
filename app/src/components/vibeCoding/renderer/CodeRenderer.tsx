import { Box } from '@alef/sys';
import { useEffect, useRef } from 'react';
import { useAgentContext } from '../AgentContext';

export interface CodeRendererProps {
	className?: string;
}

export function CodeRenderer({ className }: CodeRendererProps) {
	const { state } = useAgentContext();

	const code = state.code;

	const ref = useRef<HTMLIFrameElement>(null);
	useEffect(() => {
		if (!ref.current) {
			return;
		}
		const frame = ref.current;

		frame.srcdoc = code;
	}, [code]);

	if (!code) {
		return (
			<Box full layout="center center" className={className}>
				Nothing yet
			</Box>
		);
	}

	return (
		<Box asChild full className={className}>
			<iframe ref={ref} />
		</Box>
	);
}
