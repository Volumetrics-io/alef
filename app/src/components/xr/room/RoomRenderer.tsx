import { useFurniturePlacementIds } from '@/stores/propertyStore';
import { useResetSelectionOnClickAway } from '@/stores/propertyStore/hooks/editing';
import { Environment } from '@react-three/drei';
import { Suspense } from 'react';
import { GlobalSpace } from '../anchors/GlobalSpace';
import { PlacedFurniture } from '../furniture/PlacedFurniture';
import { SpawnFurniture } from '../furniture/SpawnFurniture';
import { RoomLighting } from '../lighting/RoomLighting';
import { SpawnLight } from '../lighting/SpawnLight';
import { NotXR } from '../util/NotXR';
import { Floors } from './Floors';
import { NonXRPlaneRenderer } from './NonXRPlaneRenderer';
import { PlaneSync } from './PlaneSync';
import { Walls } from './Walls';

export function RoomRenderer() {
	const furniturePlacementIds = useFurniturePlacementIds();
	useResetSelectionOnClickAway();

	return (
		<>
			<NotXR>
				<Environment preset="apartment" environmentIntensity={0.1} />
			</NotXR>
			<Floors />
			<Walls />
			<PlaneSync />
			<GlobalSpace>
				<SpawnFurniture />
				<SpawnLight />
				<NonXRPlaneRenderer />
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
