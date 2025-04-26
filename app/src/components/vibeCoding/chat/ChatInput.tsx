import { AGENT_ERRORS } from '@alef/common';
import { Box, Button, Frame, Icon, Input } from '@alef/sys';
import { Link } from '@verdant-web/react-router';
import { useAgentContext, useVibeCoder } from '../AgentContext';
import { useState, useRef, useCallback } from 'react';

export function ChatInput() {
	const { chat, error } = useAgentContext();
	const [isLoading, setIsLoading] = useState(false);
	const { agent } = useVibeCoder();

	const chatRef = useRef<HTMLInputElement>(null);

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

	const handleSubmit = useCallback(
		(e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			if (!chatRef.current) return;
			const input = chatRef.current.value;
			if (!input) return;
			chatRef.current.value = '';
			setIsLoading(true);
			agent.call('generateCode', [input]).then((result) => {
				console.log(result);
				setIsLoading(false);
			});
		},
		[agent]
	);

	return (
		<Box stacked gapped asChild full>
			<form onSubmit={handleSubmit}>
				<Box gapped>
					<Input ref={chatRef} placeholder="Type your message..." />
					<Button color="suggested" type="submit" loading={isLoading}>
						<Icon name="send" />
					</Button>
				</Box>
			</form>
		</Box>
	);
}
