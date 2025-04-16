import { VibeCoderState } from '@alef/services/public-api';
import { useAgent } from 'agents/react';
import { createContext, ReactNode, useContext, useState } from 'react';
import { useProjectId } from './hooks';

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
		code: '',
		description: '',
	});
	const agent = useAgent({
		agent: 'vibe-coder',
		name: projectId,
		basePath: `ai/vibe-coder/${projectId}`,
		host: import.meta.env.VITE_PUBLIC_API_ORIGIN,
		onStateUpdate: setState,
	});

	return { agent, state };
}

export const AgentProvider = ({ children }: { children: ReactNode }) => {
	const { agent, state } = useVibeCoder();
	return <AgentContext.Provider value={{ agent, state }}>{children}</AgentContext.Provider>;
};
