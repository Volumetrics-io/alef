import { useMe } from '@/services/publicApi/userHooks';
import { Avatar, Box, Logo } from '@alef/sys';
import { UIMessage } from 'ai';

export function ChatMessage({ message }: { message: UIMessage }) {
	if (message.role === 'assistant' && message.content.startsWith('{')) {
		// this is probably a code result
		let parsed: { code?: string; description?: string };
		try {
			parsed = JSON.parse(message.content);
		} catch (e) {
			// message may not be done streaming yet.
			parsed = {};
		}
		return (
			<Box p="squeeze">
				<div>
					<Role value={message.role} />: {parsed.description ? parsed.description : '(Generating code)'}
				</div>
			</Box>
		);
	}
	return (
		<Box p="squeeze">
			<div>
				<Role value={message.role} />: {message.content}
			</div>
		</Box>
	);
}

function Role({ value }: { value: string }) {
	const { data: me } = useMe();

	switch (value) {
		case 'assistant':
			return (
				<strong>
					<Logo style={{ width: 18, height: 18, display: 'inline-block' }} /> Alef
				</strong>
			);
		case 'user':
			return (
				<strong>
					<Avatar src={me?.imageUrl ?? undefined} style={{ width: 18, height: 18, padding: 0, display: 'inline-block' }} /> You
				</strong>
			);
		case 'system':
			return <strong>System</strong>;
		default:
			return <strong>{value}</strong>;
	}
}
