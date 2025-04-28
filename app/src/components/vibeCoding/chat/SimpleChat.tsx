import { Box, BoxProps } from '@alef/sys';
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

	const shownMessages = [lastAgentMessage, lastUserMessage]
		.filter((m) => !!m)
		.sort((a, b) => {
			if (!a.createdAt) return -1;
			if (!b.createdAt) return 1;
			return a.createdAt.getTime() - b.createdAt.getTime();
		});

	return (
		<Box stacked gapped full="width" constrained {...props}>
			{shownMessages.map((message, index) => (
				<ChatMessage key={index} message={message} limitHeight />
			))}
			<ChatInput />
		</Box>
	);
}
