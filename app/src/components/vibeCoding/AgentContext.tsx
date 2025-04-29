import { fetch } from '@/services/fetch';
import { AGENT_ERRORS } from '@alef/common';
import { defaultModel, VibeCoderState } from '@alef/services/public-api';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useAgentChat } from 'agents/ai-react';
import { useAgent } from 'agents/react';
import { createContext, ReactNode, useContext, useState } from 'react';
import toast from 'react-hot-toast';
import { useProjectId } from './hooks';

export type VibeCoderAgent = ReturnType<typeof useVibeCoder>['agent'];
export type VibeCoderChat = ReturnType<typeof useVibeCoderChat>;

const AgentContext = createContext<{ agent: VibeCoderAgent; state: VibeCoderState; error: string | null } | null>(null);

export function useAgentContext() {
	const ctx = useContext(AgentContext);
	if (!ctx) {
		throw new Error('useAgentContext must be used within an AgentProvider');
	}

	return ctx;
}

export function useVibeCoder(onError: (msg: string) => void) {
	const projectId = useProjectId();
	const [state, setState] = useState<VibeCoderState>({
		model: defaultModel,
		code: '',
		messages: [],
	});
	const agent = useAgent({
		agent: 'vibe-coder',
		debug: true,
		name: projectId,
		basePath: `ai/vibe-coder/${projectId}`,
		host: import.meta.env.VITE_PUBLIC_API_ORIGIN,
		onStateUpdate: setState,
		onError(event) {
			// TODO: detect known errors here...
			console.error('Agent error', event);
			toast.error('An error occurred while communicating with the agent');
		},
	});

	return { agent, state };
}

// useAgentChat's internal Suspense query for initial messages is broken, see
// https://github.com/cloudflare/agents/issues/195
export function useVibeCoderChat(agent: VibeCoderAgent, onError: (msg: string) => void) {
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
			// is it an error we know of ?
			if (Object.values(AGENT_ERRORS).includes(err.message)) {
				onError(err.message);
				return;
			}

			// otherwise, it's a generic error
			console.error(err);
			toast.error(err.message);
		},
		// reuses data between hook invocations
		id: `vibe-coder:${agent.name}`,
	});
}

export const AgentProvider = ({ children }: { children: ReactNode }) => {
	const [error, setError] = useState<string | null>(null);
	const { agent, state } = useVibeCoder(setError);
	return <AgentContext.Provider value={{ error, agent, state }}>{children}</AgentContext.Provider>;
};
