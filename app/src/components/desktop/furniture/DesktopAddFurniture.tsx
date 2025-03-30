import { useSetPlacingFurniture } from '@/stores/roomStore/hooks/editing';
import { Button, Dialog, Icon } from '@alef/sys';
import { useHotkeys } from 'react-hotkeys-hook';
import { DesktopOnlineFurniturePicker } from './DesktopOnlineFurniturePicker';
import { useContainerStore } from '../stores/useContainer';
export function DesktopAddFurniture() {
	const setSelectedModelId = useSetPlacingFurniture();
	useHotkeys('esc', () => {
		setSelectedModelId(null);
	});

	const container = useContainerStore((state) => state.container);

	return (
		<>
			<Dialog onOpenChange={() => setSelectedModelId(null)}>
				<Dialog.Trigger asChild>
					<Button color="suggested">
						<Icon name="plus" />
						Add furniture
					</Button>
				</Dialog.Trigger>
				<Dialog.Content title="Asset Library" width="large" container={container}>
					<DesktopOnlineFurniturePicker style={{ minHeight: 0 }} />
				</Dialog.Content>
			</Dialog>
		</>
	);
}
