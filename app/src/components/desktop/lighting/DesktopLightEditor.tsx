import { useDeleteLightPlacement } from '@/stores/roomStore';
import { PrefixedId } from '@alef/common';
import { Box, Button, Icon } from '@alef/sys';

export function DesktopLightEditor({ id }: { id: PrefixedId<'lp'> }) {
	const deleteSelf = useDeleteLightPlacement(id);

	return (
		<Box stacked gapped full p="small">
			<Button color="destructive" onClick={deleteSelf}>
				<Icon name="trash" />
				Delete
			</Button>
		</Box>
	);
}
