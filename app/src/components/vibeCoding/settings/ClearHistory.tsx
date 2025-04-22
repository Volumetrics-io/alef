import { Button, Icon } from '@alef/sys';
import { useAgentContext } from '../AgentContext';

export function ClearHistory() {
	const { chat } = useAgentContext();
	return (
		<Button color="destructive" onClick={chat.clearHistory}>
			<Icon name="trash" />
			Clear chat history
		</Button>
	);
}
