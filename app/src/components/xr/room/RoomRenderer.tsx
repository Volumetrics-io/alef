import { useEditorSelectionReset } from '@/stores/editorStore';
import { useFurniturePlacementIds } from '@/stores/roomStore';
import { PlacedFurniture } from '../furniture/PlacedFurniture';

export function RoomRenderer() {
	const furniturePlacementIds = useFurniturePlacementIds();

	useEditorSelectionReset();

	return (
		<>
			{furniturePlacementIds.map((furniturePlacementId) => {
				return <PlacedFurniture key={furniturePlacementId} furniturePlacementId={furniturePlacementId} />;
			})}
		</>
	);
}
