import { useEditorSelectionReset } from '@/stores/editorStore';
import { useFurniturePlacementIds } from '@/stores/roomStore';
import { Suspense } from 'react';
import { PlaneAnchor } from '../anchors';
import { PlacedFurniture } from '../furniture/PlacedFurniture';
import { RoomLighting } from '../lighting/RoomLighting';
import { Floors } from './Floors';
import { NonXRPlaneRenderer } from './NonXRPlaneRenderer';
import { PlaneSync } from './PlaneSync';
import { Walls } from './Walls';

export function RoomRenderer() {
	const furniturePlacementIds = useFurniturePlacementIds();

	useEditorSelectionReset();

	return (
		<>
			<Floors />
			<Walls />
			<PlaneSync />
			<NonXRPlaneRenderer />
			<PlaneAnchor label="floor">
				<RoomLighting />
				{furniturePlacementIds.map((furniturePlacementId) => {
					return (
						<Suspense key={furniturePlacementId}>
							<PlacedFurniture furniturePlacementId={furniturePlacementId} />
						</Suspense>
					);
				})}
			</PlaneAnchor>
		</>
	);
}
