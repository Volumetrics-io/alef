import { useEditorSelectionReset } from '@/stores/editorStore';
import { useFurniturePlacementIds } from '@/stores/roomStore';
import { Suspense } from 'react';
import { PlaneAnchor } from '../anchors';
import { PlacedFurniture } from '../furniture/PlacedFurniture';
import { RoomLighting } from '../lighting/RoomLighting';
import { Floors } from './Floors';
import { Walls } from './Walls';

export function RoomRenderer() {
	const furniturePlacementIds = useFurniturePlacementIds();

	useEditorSelectionReset();

	return (
		<>
			<Floors />
			<Walls />
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
