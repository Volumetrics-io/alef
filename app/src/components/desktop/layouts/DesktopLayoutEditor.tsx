import { useActiveRoomLayoutId, useRoomLayout, useUpdateRoomLayout } from '@/stores/roomStore';
import { Box, Button, Dialog, Form, Icon } from '@alef/sys';
import { DesktopLayoutTypeField } from './DesktopLayoutTypeField';
export interface DesktopLayoutEditorProps {
	className?: string;
}

export function DesktopLayoutEditor({ className }: DesktopLayoutEditorProps) {
	const [activeLayoutId] = useActiveRoomLayoutId();
	const layoutData = useRoomLayout(activeLayoutId);
	const updateLayout = useUpdateRoomLayout();

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
			<Dialog.Content title="Edit Layout">
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
