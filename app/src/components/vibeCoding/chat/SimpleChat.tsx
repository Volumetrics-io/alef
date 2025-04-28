import { Box, BoxProps } from '@alef/sys';
import { useAgentContext } from '../AgentContext';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';

export interface SimpleChatProps extends BoxProps {}

export function SimpleChat({ ...props }: SimpleChatProps) {
	const { state } = useAgentContext();

	// get most recent user and agent messages
	const userMessages = state.messages.filter((msg) => msg.role === 'user');
	const agentMessages = state.messages.filter((msg) => msg.role === 'assistant');
	const lastUserMessage = userMessages[userMessages.length - 1];
	const lastAgentMessage = agentMessages[agentMessages.length - 1];

	return (
		<Box stacked gapped {...props}>
			{lastUserMessage && <ChatMessage limitHeight message={lastUserMessage} />}
			{lastAgentMessage && <ChatMessage limitHeight message={lastAgentMessage} />}
			<ChatInput />
		</Box>
	);
}
