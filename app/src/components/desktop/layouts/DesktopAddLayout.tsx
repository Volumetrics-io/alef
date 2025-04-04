import { useCreateRoomLayout } from '@/stores/propertyStore';
import { Button, Icon } from '@alef/sys';

export function DesktopAddLayout() {
	const create = useCreateRoomLayout();

	return (
		<Button
			grow
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
