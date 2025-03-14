import { useCategoryFilter } from '@/stores/FilterStore';
import { Box, Heading } from '@alef/sys';
import { DesktopRoomTypePicker } from '../common/DesktopRoomTypePicker';

export function DesktopFurnitureCategoryFilter() {
	const [selectedRoomTypes, setSelectedRoomTypes] = useCategoryFilter();

	return (
		<Box stacked gapped>
			<Heading level={3}>Room type</Heading>
			<DesktopRoomTypePicker multiple value={selectedRoomTypes} onValueChange={setSelectedRoomTypes} />
		</Box>
	);
}
