import { assertPrefixedId, PrefixedId } from '@alef/common';
import { useParams } from '@verdant-web/react-router';
import { useAgentChat } from 'agents/ai-react';
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
