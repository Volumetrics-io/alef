import { AGENT_ERRORS } from '@alef/common';
import { Box, Button, Frame, Icon, Input } from '@alef/sys';
import { Link } from '@verdant-web/react-router';
import { useAgentContext } from '../AgentContext';

export function ChatInput() {
	const { chat, error } = useAgentContext();

	if (error === AGENT_ERRORS.QUOTA_EXCEEDED) {
		return (
			<Frame color="error" stacked gapped p="small" full>
				Daily AI usage limits exceeded. Upgrade for more, or try again tomorrow.
				<Button asChild>
					<Link to="?tab=settings">Upgrade</Link>
				</Button>
			</Frame>
		);
	}

	return (
		<Box stacked gapped asChild full>
			<form onSubmit={chat.handleSubmit}>
				<Box gapped>
					<Input value={chat.input} onChange={chat.handleInputChange} placeholder="Type your message..." />
					<Button color="suggested" type="submit" loading={chat.isLoading}>
						<Icon name="send" />
					</Button>
				</Box>
			</form>
		</Box>
	);
}
