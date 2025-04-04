import { useMedia } from '@/hooks/useMedia';
import { useSetPlacingFurniture } from '@/stores/propertyStore/hooks/editing';
import { Box, Button, Dialog, Icon } from '@alef/sys';
import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { DesktopOnlineFurniturePicker } from './DesktopOnlineFurniturePicker';

export function DesktopAddFurniture({ className }: { className?: string }) {
	const setSelectedModelId = useSetPlacingFurniture();
	useHotkeys('esc', () => {
		setSelectedModelId(null);
	});
	const [open, setOpen] = useState(false);

	const isMobile = useMedia('(max-width: 768px)');

	return (
		<Box className={className} full="width" justify="stretch" align="stretch">
			<Dialog onOpenChange={setOpen} open={open}>
				<Dialog.Trigger asChild>
					<Button color="suggested" full>
						<Icon name="plus" />
						Add furniture
					</Button>
				</Dialog.Trigger>
				<Dialog.Content title="Asset Library" width="large">
					<DesktopOnlineFurniturePicker
						style={{ minHeight: 0 }}
						onSelect={() => {
							// TODO: clean up this logic and make it clearer what the intention is.
							// the intention is... mobile devices are meant to be companions to
							// headsets for placing furniture, whereas on desktop we want to
							// hide the modal and let you use the viewport to place it.
							if (isMobile) return;
							setOpen(false);
						}}
					/>
				</Dialog.Content>
			</Dialog>
		</Box>
	);
}
