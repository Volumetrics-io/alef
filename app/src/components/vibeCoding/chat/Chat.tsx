import { Box, Button, Icon, Input, ScrollArea } from '@alef/sys';
import { UIMessage } from 'ai';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useVibeCoderChat } from '../hooks';

export interface ChatProps {
	className?: string;
}

export function Chat({ className }: ChatProps) {
	const { messages, handleSubmit, input, handleInputChange, isLoading, clearHistory } = useVibeCoderChat();
	const { ref, onScroll } = useStayScrolledToBottom();

	return (
		<Box full stacked p="small" className={className}>
			<ScrollArea stretched gapped stacked ref={ref} onScroll={onScroll}>
				{messages.map((msg) => (
					<ChatMessage key={msg.id} message={msg} />
				))}
			</ScrollArea>
			<Box gapped asChild>
				<form onSubmit={handleSubmit}>
					<Button color="destructive" onClick={clearHistory}>
						<Icon name="trash" />
					</Button>
					<Input value={input} onChange={handleInputChange} placeholder="Type your message..." />
					<Button type="submit" loading={isLoading}>
						<Icon name="send" />
					</Button>
				</form>
			</Box>
		</Box>
	);
}

function ChatMessage({ message }: { message: UIMessage }) {
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
