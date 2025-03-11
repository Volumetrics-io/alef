import { useCategoryFilter } from '@/stores/FilterStore';
import { DesktopRoomTypePicker } from '../common/DesktopRoomTypePicker';

export function DesktopFurnitureCategoryFilter() {
	const [selectedRoomTypes, setSelectedRoomTypes] = useCategoryFilter();

	return <DesktopRoomTypePicker multiple value={selectedRoomTypes} onValueChange={setSelectedRoomTypes} />;
}
