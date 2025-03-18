import { useAddFurniture, usePlanes } from '@/stores/roomStore';
import { useRef } from 'react';
import { Group } from 'three';

import { colors } from '../ui/theme';
import { useIsEditorStageMode, useSelectedModelId, useSetSelectedModelId, useSetPanelState } from '@/stores/editorStore';

export const SpawnFurniture = () => {
	const storedFloorPlanes = usePlanes((p) => p.label === 'floor');
	const mode = useIsEditorStageMode('furniture');
	const selectedModelId = useSelectedModelId();
	const setSelectedModelId = useSetSelectedModelId();
	const setPanelState = useSetPanelState();
	// detect primary floor, its origin length should be very small
	const primaryFloor = storedFloorPlanes.find((p) => Math.sqrt(p.origin.x * p.origin.x + p.origin.y * p.origin.y + p.origin.z * p.origin.z) < 0.01);
	const extents = primaryFloor?.extents ?? [10, 10];

	const spawnPointRef = useRef<Group>(null);

	const addFurniture = useAddFurniture();

	const addFurnitureAtSpawnPoint = (e: any) => {
		if (!selectedModelId) return;
		if (!spawnPointRef.current) return;
		addFurniture({
			furnitureId: selectedModelId,
			position: { x: e.point.x, y: 0, z: e.point.z },
			rotation: { x: 0, y: 0, z: 0, w: 1 },
		});
		setSelectedModelId(null);
		setPanelState('hidden');
		spawnPointRef.current.visible = false;
	};

	const onStart = (e: any) => {
		if (!spawnPointRef.current) return;
		if (!selectedModelId) return;
		spawnPointRef.current.visible = true;
		spawnPointRef.current.position.set(e.localPoint.x, e.localPoint.y, 0.001);
	};

	const onMove = (e: any) => {
		if (!spawnPointRef.current) return;
		if (!selectedModelId) return;
		spawnPointRef.current.position.set(e.localPoint.x, e.localPoint.y, 0.001);
	};

	const onEnd = (e: any) => {
		if (!spawnPointRef.current) return;
		if (!selectedModelId) return;
		spawnPointRef.current.visible = false;
		spawnPointRef.current.position.set(e.localPoint.x, e.localPoint.y, 0.001);
	};

	return (
		<group rotation={[-Math.PI / 2, 0, 0]}>
			{/* @ts-ignore - pointerEvents not included in typings */}
			<mesh pointerEvents={mode && selectedModelId ? 'auto' : 'none'} onPointerEnter={onStart} onPointerMove={onMove} onPointerLeave={onEnd} onClick={addFurnitureAtSpawnPoint}>
				<planeGeometry args={extents} />
				<meshBasicMaterial colorWrite={false} depthTest={false} color="red" />
			</mesh>

			<group visible={false} ref={spawnPointRef} position={[0, 0.1, 0]}>
				<mesh renderOrder={1000}>
					<ringGeometry args={[0.25, 0.3, 64]} />
					<meshBasicMaterial color={colors.focus.value} />
				</mesh>
				<mesh renderOrder={1000}>
					<ringGeometry args={[0.4, 0.43, 64]} />
					<meshBasicMaterial color={colors.focus.value} />
				</mesh>
			</group>
		</group>
	);
};
