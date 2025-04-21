import { AGENT_ERRORS } from '@alef/common';
import { VibeCoderModel } from '@alef/services/public-api';
import { Box, Button, Frame, Icon, Input, ScrollArea, Select } from '@alef/sys';
import { Link } from '@verdant-web/react-router';
import { UIMessage } from 'ai';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useAgentContext, VibeCoderChat, VibeCoderModelNames } from '../AgentContext';

export interface ChatProps {
	className?: string;
}

export function Chat({ className }: ChatProps) {
	const { chat, error } = useAgentContext();

	return (
		<Box full stacked p="small" className={className}>
			<Suspense>
				<ChatSettings />
			</Suspense>
			<Suspense>
				<ChatHistory chat={chat} />
			</Suspense>
			<Suspense>
				{error === AGENT_ERRORS.QUOTA_EXCEEDED ? (
					<Frame color="error" stacked gapped p="small">
						Daily AI usage limits exceeded. Upgrade for more, or try again tomorrow.
						<Button asChild>
							<Link to="/settings">Upgrade</Link>
						</Button>
					</Frame>
				) : (
					<ChatForm chat={chat} />
				)}
			</Suspense>
		</Box>
	);
}

function ChatSettings() {
	const { state, agent } = useAgentContext();

	const setModel = useCallback(
		(model: VibeCoderModel) => {
			console.log('setting model', model);
			agent.call('setModel', [model]);
		},
		[agent]
	);

	return (
		<Box full="width" stacked>
			<Select value={state.model} onValueChange={(value) => setModel(value as VibeCoderModel)}>
				{VibeCoderModelNames.map((key) => (
					<Select.Item key={key} value={key}>
						{key}
					</Select.Item>
				))}
			</Select>
		</Box>
	);
}

function ChatHistory({ chat }: { chat: VibeCoderChat }) {
	const { ref, onScroll } = useStayScrolledToBottom();
	return (
		<ScrollArea stretched gapped stacked ref={ref} onScroll={onScroll}>
			{chat.messages.map((msg) => (
				<ChatMessage key={msg.id} message={msg} />
			))}
			<Box full="width" style={{ marginBottom: '3dvh' }}></Box>
		</ScrollArea>
	);
}

function ChatForm({ chat }: { chat: VibeCoderChat }) {
	return (
		<Box stacked gapped asChild>
			<form onSubmit={chat.handleSubmit}>
				<Box gapped>
					<Input value={chat.input} onChange={chat.handleInputChange} placeholder="Type your message..." />
					<Button type="submit" loading={chat.isLoading}>
						<Icon name="send" />
					</Button>
				</Box>
				<Button color="destructive" onClick={chat.clearHistory}>
					<Icon name="trash" />
				</Button>
			</form>
		</Box>
	);
}

function ChatMessage({ message }: { message: UIMessage }) {
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
			<Box p="squeeze">
				<div>
					<strong>{message.role}</strong>: {parsed.description ? parsed.description : '(Generating code)'}
				</div>
			</Box>
		);
	}
	return (
		<Box p="squeeze">
			<div>
				<strong>{message.role}</strong>: {message.content}
			</div>
		</Box>
	);
}

function useStayScrolledToBottom() {
	const ref = useRef<HTMLDivElement>(null);
	// if the div was already scrolled to the bottom,
	// keep it at the bottom when new messages come in
	const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);

	useEffect(() => {
		if (!ref.current) return;
		if (isScrolledToBottom) {
			ref.current.scrollTop = ref.current.scrollHeight;
		}
		const observer = new MutationObserver(() => {
			if (!ref.current) return;
			if (isScrolledToBottom) {
				ref.current.scrollTop = ref.current.scrollHeight;
			}
		});
		observer.observe(ref.current, { childList: true });
		return () => {
			observer.disconnect();
		};
	}, [isScrolledToBottom, ref]);

	const onScroll = useCallback(() => {
		if (!ref.current) return;
		setIsScrolledToBottom(ref.current.scrollTop + ref.current.clientHeight >= ref.current.scrollHeight - 10);
	}, []);

	return {
		ref,
		onScroll,
	};
}
