import { Box, BoxProps, Frame, ScrollArea } from '@alef/sys';
import { ReactNode } from 'react';
import { useAgentContext } from '../AgentContext';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';

export interface SimpleChatProps extends BoxProps {}

export function SimpleChat({ ...props }: SimpleChatProps) {
	const { chat } = useAgentContext();

	// get most recent user and agent messages
	const userMessages = chat.messages.filter((msg) => msg.role === 'user');
	const agentMessages = chat.messages.filter((msg) => msg.role === 'assistant');
	const lastUserMessage = userMessages[userMessages.length - 1];
	const lastAgentMessage = agentMessages[agentMessages.length - 1];

	return (
		<Box stacked gapped {...props}>
			{lastUserMessage && (
				<Bubble side="right">
					<ChatMessage message={lastUserMessage} />
				</Bubble>
			)}
			{lastAgentMessage && (
				<Bubble side="left">
					<ChatMessage message={lastAgentMessage} />
				</Bubble>
			)}
			<ChatInput />
		</Box>
	);
}

function Bubble({ children, side }: { children: ReactNode; side: 'left' | 'right' }) {
	return (
		<Frame style={{ maxHeight: 180, alignSelf: side === 'left' ? 'flex-start' : 'flex-end', maxWidth: '80%', background: side === 'left' ? 'var(--track)' : 'var(--happy-paper)' }}>
			<ScrollArea>
				<Box p="small" stacked gapped>
					{children}
				</Box>
			</ScrollArea>
		</Frame>
	);
}
