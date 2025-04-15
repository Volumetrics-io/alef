import { Box } from '@alef/sys';
import { Suspense } from 'react';
import { AgentProvider } from './AgentContext';
import { Chat } from './chat/Chat';
import { CodeRenderer } from './renderer/CodeRenderer';
import cls from './VibeCodingUI.module.css';

export interface VibeCodingUIProps {}

export function VibeCodingUI({}: VibeCodingUIProps) {
	return (
		<AgentProvider>
			<Box full className={cls.root}>
				<Suspense>
					<Chat className={cls.chat} />
				</Suspense>
				<Suspense>
					<CodeRenderer className={cls.renderer} />
				</Suspense>
			</Box>
		</AgentProvider>
	);
}
