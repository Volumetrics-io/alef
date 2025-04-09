import { useActiveRoomLayoutId } from '@/stores/propertyStore';
import { usePropertyId } from '@/stores/propertyStore/hooks/property';
import { useSelectedRoomId } from '@/stores/propertyStore/hooks/rooms';
import { Box, Button, Dialog, Icon, ScrollArea } from '@alef/sys';
import { useAgentChat } from 'agents/ai-react';
import { useAgent } from 'agents/react';

export interface DesktopMagicLayoutProps {}

export function DesktopMagicLayout({}: DesktopMagicLayoutProps) {
	const propertyId = usePropertyId();
	const roomId = useSelectedRoomId();
	const layoutId = useActiveRoomLayoutId();

	const agent = useAgent({
		agent: 'layout',
		path: `ai/layout/${propertyId}`,
		host: import.meta.env.VITE_PUBLIC_API_ORIGIN,
	});

	const { setInput, handleSubmit, messages, isLoading } = useAgentChat({
		agent,
		maxSteps: 5,
	});

	const sendLayoutRequest = async () => {
		setInput(`Rearrange the furniture currently in the room with ID ${roomId} and layout ID ${layoutId} to make sense in the space.`);
		handleSubmit();
	};

	return (
		<Box gapped align="center">
			<Button onClick={sendLayoutRequest} loading={isLoading}>
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
					<ScrollArea>
						<Box stacked gapped>
							{messages.map((m, i) => (
								<Box p="small" key={i}>
									{JSON.stringify(m)}
								</Box>
							))}
						</Box>
					</ScrollArea>
				</Dialog.Content>
			</Dialog>
		</Box>
	);
}
