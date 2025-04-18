import { VibeCoderState } from '@alef/services/public-api';
import { useAgent } from 'agents/react';
import { createContext, ReactNode, useContext, useState } from 'react';
import { useProjectId } from './hooks';

export const VibeCoderModelNames = ['llama-3.3-70b', 'deepseek-r1-qwen-32b', 'llama-4-scout-17b', 'gemma-3-12b', 'qwq-32b', 'qwen2.5-coder-32b'] as const;

const AgentContext = createContext<{ agent: any; state: VibeCoderState } | null>(null);

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
		messages: [],
	});
	const agent = useAgent({
		agent: 'vibe-coder',
		prefix: 'some/prefix',
		name: projectId,
		basePath: `ai/vibe-coder/${projectId}`,
		host: import.meta.env.VITE_PUBLIC_API_ORIGIN,
		onStateUpdate: (state) => {
			console.log('state update', state);
			setState(state as VibeCoderState);
		},
	});

	return { agent, state };
}

export const AgentProvider = ({ children }: { children: ReactNode }) => {
	const { agent, state } = useVibeCoder();
	return <AgentContext.Provider value={{ agent, state }}>{children}</AgentContext.Provider>;
};
