import { Icon, Button, Box } from '@alef/sys';
import { DesktopDeleteFurniture } from './DesktopDeleteFurniture';
import { useFurnitureQuickSwap, useFurniturePlacement } from '@/stores/roomStore';
import { PrefixedId, RoomFurniturePlacement } from '@alef/common';
export function DesktopSelectedFurnitureTools({ id }: { id: PrefixedId<'fp'> }) {
	const placement = useFurniturePlacement(id);
	if (!placement) return null;

	return (
		<Box gapped grow>
			<SwapButton placement={placement} direction="left" />
			<DesktopDeleteFurniture />
			<SwapButton placement={placement} direction="right" />
		</Box>
	);
}

interface SwapButtonProps {
	placement: RoomFurniturePlacement;
	direction: 'left' | 'right';
}

export function SwapButton({ placement, direction }: SwapButtonProps) {
	const { swapPrevious, swapNext } = useFurnitureQuickSwap(placement);
	return (
		<Button color="suggested" grow onClick={direction === 'left' ? swapPrevious : swapNext}>
			<Icon name={direction === 'left' ? 'arrow-left' : 'arrow-right'} />
		</Button>
	);
}
