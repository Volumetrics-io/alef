import { useFurniturePlacement, useFurniturePlacementIds, useSubscribeToPlacementPosition } from '@/stores/roomStore';
import { PrefixedId } from '@alef/common';
import { animated, useSpring } from '@react-spring/three';
import { OrbitControls } from '@react-three/drei';
import { useXR } from '@react-three/xr';
import { FurnitureModel } from '../furniture/FurnitureModel';

const AGroup = animated('group');

export function RoomRenderer() {
	const furniturePlacementIds = useFurniturePlacementIds();
	const { session } = useXR();

	return (
		<>
			{furniturePlacementIds.map((furniturePlacementId) => {
				return <RoomFurniture key={furniturePlacementId} furniturePlacementId={furniturePlacementId} />;
			})}
			<OrbitControls enabled={!session} />
		</>
	);
}

function RoomFurniture({ furniturePlacementId }: { furniturePlacementId: PrefixedId<'fp'> }) {
	const placement = useFurniturePlacement(furniturePlacementId);

	// animate the furniture to its placement position as it changes
	const [{ position }, spring] = useSpring(() => ({
		position: placement.worldPosition,
	}));

	useSubscribeToPlacementPosition(furniturePlacementId, (position) => {
		spring.start({ position });
	});

	return (
		<AGroup position={position}>
			<FurnitureModel furnitureId={placement.furnitureId} />
		</AGroup>
	);
}
