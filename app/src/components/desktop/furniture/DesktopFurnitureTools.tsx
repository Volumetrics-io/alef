import { useFurniturePlacement, useFurnitureQuickSwap } from '@/stores/roomStore';
import { PrefixedId, RoomFurniturePlacement } from '@alef/common';
import { Box, Button, Icon } from '@alef/sys';
import { DesktopDeleteFurniture } from './DesktopDeleteFurniture';
export function DesktopSelectedFurnitureTools({ id }: { id: PrefixedId<'fp'> }) {
	const placement = useFurniturePlacement(id);
	if (!placement) return null;

	return (
		<Box gapped grow>
			<SwapButton placement={placement} direction="left" />
			<DesktopDeleteFurniture placementId={id} />
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
