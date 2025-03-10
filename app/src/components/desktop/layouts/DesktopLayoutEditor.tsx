import { useActiveRoomLayoutId, useRoomLayout, useUpdateRoomLayout } from '@/stores/roomStore';
import { PrefixedId } from '@alef/common';
import { Box, Form } from '@alef/sys';

export interface DesktopLayoutEditorProps {
	layoutId?: PrefixedId<'rl'>;
}

export function DesktopLayoutEditor({ layoutId }: DesktopLayoutEditorProps) {
	const [activeLayoutId] = useActiveRoomLayoutId();
	const layoutData = useRoomLayout(layoutId || activeLayoutId);
	const updateLayout = useUpdateRoomLayout();

	if (!layoutData) {
		return <Box>Missing layout</Box>;
	}

	return (
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
		></Form>
	);
}
