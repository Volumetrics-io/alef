import { useActiveRoomLayoutId, usePropertyId, useSelectedRoomId } from '@/stores/propertyStore';
import { Box, Button, Dialog, Icon, Input, ScrollArea } from '@alef/sys';
import { useAgentChat } from 'agents/ai-react';
import { useAgent } from 'agents/react';
import toast from 'react-hot-toast';

export interface DesktopMagicLayoutProps {}

export function DesktopMagicLayout({}: DesktopMagicLayoutProps) {
	const propertyId = usePropertyId();
	const roomId = useSelectedRoomId();
	const [layoutId] = useActiveRoomLayoutId();

	const agent = useAgent({
		agent: 'layout',
		basePath: `ai/layout/${propertyId}`,
		host: import.meta.env.VITE_PUBLIC_API_ORIGIN,
	});

	const { handleInputChange, input, setInput, handleSubmit, messages, isLoading, clearHistory, append } = useAgentChat({
		credentials: 'include',
		agent,
		maxSteps: 5,
		onError: (err) => {
			toast.error(err.message);
		},
	});

	const prompt = `Rearrange the furniture currently in the room with ID ${roomId} and layout ID ${layoutId} to make sense in the space.`;

	const sendLayoutRequest = async () => {
		append({
			role: 'user',
			content: prompt,
		});
	};

	return (
		<Box gapped align="center" full="width">
			<Button onClick={sendLayoutRequest} loading={isLoading} stretched>
				<Icon name="sparkles" />
				Layout for me
			</Button>
			<Dialog>
				<Dialog.Trigger asChild>
					<Button color="ghost">
						<Icon name="bug" />
					</Button>
				</Dialog.Trigger>
				<Dialog.Content title="Chat log">
					<ScrollArea style={{ maxHeight: '70vh' }}>
						<Box stacked gapped p="small">
							{messages.map((m, i) => (
								<div key={i}>
									<strong style={{ width: 100 }}>[{m.role}]</strong> {m.content}
								</div>
							))}
						</Box>
					</ScrollArea>
					<Box gapped asChild>
						<form onSubmit={handleSubmit}>
							<Button onClick={() => setInput(prompt)} loading={isLoading}>
								<Icon name="sparkles" />
							</Button>
							<Button onClick={clearHistory} color="destructive">
								<Icon name="ban" /> Forget
							</Button>
							<Input value={input} onChange={handleInputChange} placeholder="Send a message" />
							<Button type="submit" loading={isLoading}>
								<Icon name="send" />
							</Button>
						</form>
					</Box>
				</Dialog.Content>
			</Dialog>
		</Box>
	);
}
