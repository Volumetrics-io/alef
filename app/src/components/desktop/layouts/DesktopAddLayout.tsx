import { useCreateRoomLayout } from '@/stores/roomStore';
import { Button, Icon } from '@alef/sys';

export function DesktopAddLayout() {
	const create = useCreateRoomLayout();

	return (
		<Button
			color="suggested"
			onClick={() => {
				create();
			}}
		>
			<Icon name="plus" />
			New layout
		</Button>
	);
}
