import { Button, Dialog, Icon } from '@alef/sys';
import { useState } from 'react';
import { DesktopOnlineFurniturePicker } from './DesktopOnlineFurniturePicker';

export function DesktopAddFurniture() {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Dialog open={open} onOpenChange={setOpen}>
				<Dialog.Trigger asChild>
					<Button color="suggested">
						<Icon name="plus" />
						Add furniture
					</Button>
				</Dialog.Trigger>
				<Dialog.Content title="Add furniture" width="large">
					<DesktopOnlineFurniturePicker
						style={{ minHeight: 0 }}
						onSelect={() => {
							setOpen(false);
						}}
					/>
				</Dialog.Content>
			</Dialog>
		</>
	);
}
