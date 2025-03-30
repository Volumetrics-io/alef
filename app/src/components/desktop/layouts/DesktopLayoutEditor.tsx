import { useActiveRoomLayoutId, useRoomLayout, useUpdateRoomLayout } from '@/stores/roomStore';
import { Box, Dialog, Form, Icon, Button } from '@alef/sys';
import { DesktopLayoutTypeField } from './DesktopLayoutTypeField';
import { useContainerStore } from '../stores/useContainer';
export interface DesktopLayoutEditorProps {
	className?: string;
}

export function DesktopLayoutEditor({ className }: DesktopLayoutEditorProps) {
	const [activeLayoutId] = useActiveRoomLayoutId();
	const layoutData = useRoomLayout(activeLayoutId);
	const updateLayout = useUpdateRoomLayout();

	const container = useContainerStore((state) => state.container);

	if (!layoutData) {
		return null;
	}

	return (
		<Dialog>
			<Dialog.Trigger asChild>
				<Button>
					<Icon name="pencil" />
				</Button>
			</Dialog.Trigger>
			<Dialog.Content title="Edit Layout" container={container}>
				<Box p="small" className={className} stacked gapped>
					<Form
						initialValues={{
							name: layoutData.name ?? '',
							type: layoutData.type ?? 'living-room',
						}}
						enableReinitialize
						onSubmit={(values) => {
							updateLayout({
								id: layoutData.id,
								...values,
							});
						}}
					>
						<Form.TextField name="name" label="Name" required />
						<DesktopLayoutTypeField name="type" />
						<Form.Actions>
							<Form.Submit>Save</Form.Submit>
						</Form.Actions>
					</Form>
				</Box>
			</Dialog.Content>
		</Dialog>
	);
}
