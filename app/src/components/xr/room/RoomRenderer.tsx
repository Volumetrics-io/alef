import { useEditorSelectionReset, useUpdateClosestFloorCenter } from '@/stores/editorStore';
import { useFurniturePlacementIds } from '@/stores/roomStore';
import { Suspense } from 'react';
import { GlobalSpace } from '../anchors/GlobalSpace';
import { PlacedFurniture } from '../furniture/PlacedFurniture';
import { RoomLighting } from '../lighting/RoomLighting';
import { Floors } from './Floors';
import { NonXRPlaneRenderer } from './NonXRPlaneRenderer';
import { PlaneSync } from './PlaneSync';
import { Walls } from './Walls';

export function RoomRenderer() {
	const furniturePlacementIds = useFurniturePlacementIds();

	useEditorSelectionReset();
	useUpdateClosestFloorCenter();

	return (
		<>
			<Floors />
			<Walls />
			<PlaneSync />
			<GlobalSpace>
				<NonXRPlaneRenderer debug />
				<RoomLighting />
				{furniturePlacementIds.map((furniturePlacementId) => {
					return (
						<Suspense key={furniturePlacementId}>
							<PlacedFurniture furniturePlacementId={furniturePlacementId} />
						</Suspense>
					);
				})}
			</GlobalSpace>
		</>
	);
}
