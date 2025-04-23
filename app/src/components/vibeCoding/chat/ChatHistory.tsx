import { Frame, ScrollArea } from '@alef/sys';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAgentContext } from '../AgentContext';
import cls from './ChatHistory.module.css';
import { ChatMessage } from './ChatMessage';

export function ChatHistory() {
	const { chat } = useAgentContext();
	const { ref, onScroll } = useStayScrolledToBottom();
	return (
		<Frame className={cls.root}>
			<ScrollArea stretched gapped stacked ref={ref} onScroll={onScroll}>
				{chat.messages.map((msg) => (
					<ChatMessage key={msg.id} message={msg} />
				))}
			</ScrollArea>
		</Frame>
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
