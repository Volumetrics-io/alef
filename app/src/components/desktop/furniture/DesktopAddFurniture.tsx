import { useSetPlacingFurniture } from '@/stores/roomStore/hooks/editing';
import { Box, Button, Dialog, Icon } from '@alef/sys';
import { useHotkeys } from 'react-hotkeys-hook';
import { DesktopOnlineFurniturePicker } from './DesktopOnlineFurniturePicker';

export function DesktopAddFurniture({ className }: { className?: string }) {
	const setSelectedModelId = useSetPlacingFurniture();
	useHotkeys('esc', () => {
		setSelectedModelId(null);
	});

	return (
		<Box className={className} full="width" justify="stretch" align="stretch">
			<Dialog onOpenChange={() => setSelectedModelId(null)}>
				<Dialog.Trigger asChild>
					<Button color="suggested" full>
						<Icon name="plus" />
						Add furniture
					</Button>
				</Dialog.Trigger>
				<Dialog.Content title="Asset Library" width="large">
					<DesktopOnlineFurniturePicker style={{ minHeight: 0 }} />
				</Dialog.Content>
			</Dialog>
		</Box>
	);
}
