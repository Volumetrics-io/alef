import { useEditorSelectionReset } from '@/stores/editorStore';
import { useFurniturePlacementIds } from '@/stores/roomStore';
import { PlacedFurniture } from '../furniture/PlacedFurniture';
import { RoomLighting } from '../lighting/RoomLighting';
import { DebugDisplay } from './DebugDisplay';
import { Floors } from './Floors';
import { Walls } from './Walls';

export function RoomRenderer() {
	const furniturePlacementIds = useFurniturePlacementIds();

	useEditorSelectionReset();

	return (
		<>
			<Floors />
			<Walls />
			{furniturePlacementIds.map((furniturePlacementId) => {
				return <PlacedFurniture key={furniturePlacementId} furniturePlacementId={furniturePlacementId} />;
			})}
			<RoomLighting />
			<DebugDisplay />
		</>
	);
}
