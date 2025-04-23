import { useMe } from '@/services/publicApi/userHooks';
import { Avatar, Box, Frame, Logo, ScrollArea } from '@alef/sys';
import { UIMessage } from 'ai';
import { ReactNode } from 'react';

export function ChatMessage({ message, limitHeight }: { message: UIMessage; limitHeight?: boolean }) {
	const side = message.role === 'user' ? 'right' : 'left';
	if (message.role === 'assistant' && message.content.startsWith('{')) {
		// this is probably a code result
		let parsed: { code?: string; description?: string };
		try {
			parsed = JSON.parse(message.content);
		} catch (e) {
			// message may not be done streaming yet.
			parsed = {};
		}
		return (
			<Bubble side={side} limitHeight={limitHeight}>
				<Box p="squeeze">
					<div>
						<Role value={message.role} />: {parsed.description ? parsed.description : '(Generating code)'}
					</div>
				</Box>
			</Bubble>
		);
	}
	return (
		<Bubble side={side} limitHeight={limitHeight}>
			<Box p="squeeze">
				<div>
					<Role value={message.role} />: {message.content}
				</div>
			</Box>
		</Bubble>
	);
}

function Role({ value }: { value: string }) {
	const { data: me } = useMe();

	switch (value) {
		case 'assistant':
			return (
				<strong>
					<Logo style={{ position: 'relative', top: 2, width: 18, height: 18, display: 'inline-block' }} /> Alef
				</strong>
			);
		case 'user':
			return (
				<strong>
					<Avatar src={me?.imageUrl ?? undefined} style={{ position: 'relative', top: -2, width: 20, height: 20, padding: 0, display: 'inline-block', fontSize: 10 }} /> You
				</strong>
			);
		case 'system':
			return <strong>System</strong>;
		default:
			return <strong>{value}</strong>;
	}
}

function Bubble({ children, side, limitHeight }: { children: ReactNode; limitHeight?: boolean; side: 'left' | 'right' }) {
	return (
		<Frame
			style={{
				flexShrink: 0,
				maxHeight: limitHeight ? 180 : undefined,
				alignSelf: side === 'left' ? 'flex-start' : 'flex-end',
				maxWidth: '80%',
				background: side === 'left' ? 'var(--track)' : 'var(--happy-paper)',
			}}
		>
			<ScrollArea direction="both">
				<Box p="small" stacked gapped>
					{children}
				</Box>
			</ScrollArea>
		</Frame>
	);
}
