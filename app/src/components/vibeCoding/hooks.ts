import { assertPrefixedId, PrefixedId } from '@alef/common';
import { useParams } from '@verdant-web/react-router';
import { useAgentChat } from 'agents/ai-react';
import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAgentContext } from './AgentContext';

export function useProjectId() {
	// repurposing properties for this...
	const { projectId } = useParams<{ projectId: PrefixedId<'p'> }>();
	assertPrefixedId(projectId, 'p');
	return projectId;
}

export function useVibeCoderChat() {
	const { agent } = useAgentContext();
	const prevAgent = useRef(agent);
	useEffect(() => {
		console.log('agent', agent, agent === prevAgent.current);
		prevAgent.current = agent;
	}, [agent]);
	return useAgentChat({
		credentials: 'include',
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
export type VibeCoderChat = ReturnType<typeof useVibeCoderChat>;
