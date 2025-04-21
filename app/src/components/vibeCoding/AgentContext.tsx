import { fetch } from '@/services/fetch';
import { VibeCoderState } from '@alef/services/public-api';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useAgentChat } from 'agents/ai-react';
import { useAgent } from 'agents/react';
import { createContext, ReactNode, useContext, useState } from 'react';
import toast from 'react-hot-toast';
import { useProjectId } from './hooks';

export const VibeCoderModelNames = ['llama-3.3-70b', 'deepseek-r1-qwen-32b', 'llama-4-scout-17b', 'gemma-3-12b', 'qwq-32b', 'qwen2.5-coder-32b'] as const;

export type VibeCoderAgent = ReturnType<typeof useVibeCoder>['agent'];
export type VibeCoderChat = ReturnType<typeof useVibeCoderChat>;

const AgentContext = createContext<{ agent: VibeCoderAgent; chat: VibeCoderChat; state: VibeCoderState } | null>(null);

export function useAgentContext() {
	const ctx = useContext(AgentContext);
	if (!ctx) {
		throw new Error('useAgentContext must be used within an AgentProvider');
	}

	return ctx;
}

export function useVibeCoder() {
	const projectId = useProjectId();
	const [state, setState] = useState<VibeCoderState>({
		model: 'qwq-32b',
		code: '',
		description: '',
	});
	const agent = useAgent({
		id: 'vibe-coder',
		agent: 'vibe-coder',
		debug: true,
		name: projectId,
		basePath: `ai/vibe-coder/${projectId}`,
		host: import.meta.env.VITE_PUBLIC_API_ORIGIN,
		onStateUpdate: setState,
	});

	return { agent, state };
}

// useAgentChat's internal Suspense query for initial messages is broken, see
// https://github.com/cloudflare/agents/issues/195
export function useVibeCoderChat(agent: VibeCoderAgent) {
	const agentUrl = new URL(
		`${// @ts-expect-error we're using a protected _url property that includes query params
		((agent._url as string | null) || agent._pkurl)?.replace('ws://', 'http://').replace('wss://', 'https://')}`
	);

	// delete the _pk query param
	agentUrl.searchParams.delete('_pk');
	const agentUrlString = agentUrl.toString();
	const initialMessages = useSuspenseQuery({
		queryKey: ['vibe-coder', agent.name, 'get-messages'],
		queryFn: async () => {
			const response = await fetch(`${agentUrlString}/get-messages`, {
				credentials: 'include',
			});
			if (!response.ok) {
				throw new Error('Failed to fetch initial messages');
			}
			return response.json();
		},
	});
	return useAgentChat({
		credentials: 'include',
		initialMessages: initialMessages.data ?? [],
		getInitialMessages: null,
		agent,
		maxSteps: 3,
		onError: (err) => {
			console.error(err);
			toast.error(err.message);
		},
		// reuses data between hook invocations
		id: 'vibe-coder',
	});
}

export const AgentProvider = ({ children }: { children: ReactNode }) => {
	const { agent, state } = useVibeCoder();
	const chat = useVibeCoderChat(agent);
	return <AgentContext.Provider value={{ chat, agent, state }}>{children}</AgentContext.Provider>;
};
