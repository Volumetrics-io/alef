import { Box, Button, Icon, Input, ScrollArea, Form } from '@alef/sys';
import { UIMessage } from 'ai';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAgentContext } from '../AgentContext';

export interface ChatProps {
	className?: string;
}

export function Chat({ className }: ChatProps) {
	const { state } = useAgentContext();
	const { ref, onScroll } = useStayScrolledToBottom();

	return (
		<Box full stacked p="small" className={className}>
			<ScrollArea stretched gapped stacked ref={ref} onScroll={onScroll}>
				{state.messages.map((msg) => (
					<ChatMessage key={msg.id} message={msg} />
				))}
			</ScrollArea>
			<ChatForm />
		</Box>
	);
}

function ChatForm() {
	const { agent } = useAgentContext();

	const inputRef = useRef<HTMLInputElement>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = useCallback(
		async (e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			setIsLoading(true);
			try {
				await agent.call('generateCode', [inputRef.current?.value]);
			} catch (error) {
				console.error(error);
			} finally {
				setIsLoading(false);
			}
		},
		[agent, inputRef]
	);

	return (
		<Box gapped asChild>
			<Form onSubmit={handleSubmit}>
				<Box gapped>
					<Input ref={inputRef} placeholder="Type your message..." />
					<Button type="submit" loading={isLoading}>
						<Icon name="send" />
					</Button>
				</Box>
				{/* <Button color="destructive" onClick={clearHistory}>
					<Icon name="trash" />
				</Button> */}
			</Form>
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
