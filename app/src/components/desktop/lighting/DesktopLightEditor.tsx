import { useDeleteLightPlacement, useLightPlacement } from '@/stores/roomStore';
import { useSelectedLightPlacementId } from '@/stores/roomStore/hooks/editing';
import { RoomLightPlacement } from '@alef/common';
import { Box, Button, Heading, Icon } from '@alef/sys';

export function DesktopLightEditor() {
	const selectedId = useSelectedLightPlacementId();
	const placement = useLightPlacement(selectedId || 'lp-none');

	if (!placement) {
		return null;
	}

	return <DesktopLightEditorImpl placement={placement} />;
}
function DesktopLightEditorImpl({ placement }: { placement: RoomLightPlacement }) {
	const deleteSelf = useDeleteLightPlacement(placement.id);

	return (
		<Box stacked gapped full p="small">
			<Heading level={4}>Manage</Heading>
			<Button color="destructive" onClick={deleteSelf}>
				<Icon name="trash" />
				Delete
			</Button>
		</Box>
	);
}
