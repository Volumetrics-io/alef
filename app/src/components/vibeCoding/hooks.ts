import { assertPrefixedId, PrefixedId } from '@alef/common';
import { useParams } from '@verdant-web/react-router';

export function useProjectId() {
	// repurposing properties for this...
	const { projectId } = useParams<{ projectId: PrefixedId<'p'> }>();
	assertPrefixedId(projectId, 'p');
	return projectId;
}
