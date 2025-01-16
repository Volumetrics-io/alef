import { useFurniturePlacementIds } from '@/stores/roomStore';
import { FirstPersonControls } from '@react-three/drei';
import { useXR } from '@react-three/xr';
import { PlacedFurniture } from '../furniture/PlacedFurniture';

export function RoomRenderer() {
	const furniturePlacementIds = useFurniturePlacementIds();
	const { session } = useXR();

	return (
		<>
			{furniturePlacementIds.map((furniturePlacementId) => {
				return <PlacedFurniture key={furniturePlacementId} furniturePlacementId={furniturePlacementId} />;
			})}
			<FirstPersonControls enabled={!session} activeLook={false} autoForward={false} />
		</>
	);
}
