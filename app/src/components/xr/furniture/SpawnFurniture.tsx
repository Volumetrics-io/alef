import { useFurnitureModel } from '@/services/publicApi/furnitureHooks';
import { useIsEditorStageMode, useSelectedModelId, useSetPanelState, useSetSelectedModelId } from '@/stores/editorStore';
import { useAddFurniture, usePlanes } from '@/stores/roomStore';
import { PrefixedId } from '@alef/common';
import { useMergedRef } from '@alef/sys';
import { useFrame, useThree } from '@react-three/fiber';
import { forwardRef, Suspense, useEffect, useRef } from 'react';
import { DoubleSide, Euler, Group, Quaternion, Vector3 } from 'three';
import { Cursor } from '../ui/Cursor';
import { CollisionModel } from './FurnitureModel';
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
	const modelRef = useRef<Group>(null);

	const quaternionRef = useRef<Quaternion>(new Quaternion());

	const addFurniture = useAddFurniture();

	const addFurnitureAtSpawnPoint = (e: any) => {
		if (!selectedModelId) return;
		if (!spawnPointRef.current || !modelRef.current) return;
		modelRef.current.getWorldQuaternion(quaternionRef.current);
		addFurniture({
			furnitureId: selectedModelId,
			position: { x: e.localPoint.x, y: 0, z: e.localPoint.y },
			rotation: modelRef.current.quaternion,
		});
		setSelectedModelId(null);
		setPanelState('hidden');
		spawnPointRef.current.visible = false;
	};

	const onStart = (e: any) => {
		if (!spawnPointRef.current) return;
		if (!selectedModelId) return;
		spawnPointRef.current.visible = true;
		spawnPointRef.current.position.set(e.localPoint.x, 0.001, e.localPoint.y);
	};

	const onMove = (e: any) => {
		if (!spawnPointRef.current) return;
		if (!selectedModelId) return;
		spawnPointRef.current.position.set(e.localPoint.x, 0.001, e.localPoint.y);
	};

	const onEnd = (e: any) => {
		if (!spawnPointRef.current) return;
		if (!selectedModelId) return;
		spawnPointRef.current.visible = false;
		spawnPointRef.current.position.set(e.localPoint.x, 0.001, e.localPoint.y);
	};

	return (
		<group>
			<group rotation={[Math.PI / 2, 0, 0]}>
				{/* @ts-ignore - pointerEvents not included in typings */}
				<mesh pointerEvents={mode && selectedModelId ? 'auto' : 'none'} onPointerEnter={onStart} onPointerMove={onMove} onPointerLeave={onEnd} onClick={addFurnitureAtSpawnPoint}>
					<planeGeometry args={extents} />
					<meshBasicMaterial colorWrite={false} depthTest={false} color="red" side={DoubleSide} />
				</mesh>
			</group>

			<Cursor visible={false} ref={spawnPointRef} position={[0, 0.1, 0]}>
				<Suspense>
					<GhostModel furnitureId={selectedModelId} ref={modelRef} />
				</Suspense>
			</Cursor>
		</group>
	);
};

const GhostModel = forwardRef<Group, { furnitureId: PrefixedId<'f'> | null }>(({ furnitureId }, ref) => {
	const groupRef = useRef<Group>(null!);
	const camera = useThree((state) => state.camera);

	// Create reusable vectors to avoid garbage collection
	const tempVars = useRef({
		cameraWorldPos: new Vector3(),
		objectWorldPos: new Vector3(),
		directionToCamera: new Vector3(),
		localObjectPos: new Vector3(),
		localCameraPos: new Vector3(),
		originalRotation: new Euler(),
	});

	// preload models while placing
	useEffect(() => {
		if (furnitureId) {
			useFurnitureModel.preload(furnitureId);
		}
	}, [furnitureId]);

	useFrame(() => {
		if (!groupRef.current) return;
		if (!furnitureId) return;

		// Add defensive checks for matrixWorld
		if (!groupRef.current.matrixWorld || !camera.matrixWorld) return;

		const { cameraWorldPos, objectWorldPos, directionToCamera, localObjectPos, localCameraPos, originalRotation } = tempVars.current;

		// Get camera position in world space
		camera.getWorldPosition(cameraWorldPos);

		// Get object position in world space
		groupRef.current.getWorldPosition(objectWorldPos);

		// Transform camera position to local space of the parent
		if (groupRef.current.parent && groupRef.current.parent.matrixWorld) {
			localCameraPos.copy(cameraWorldPos);
			groupRef.current.parent.worldToLocal(localCameraPos);
		} else {
			localCameraPos.copy(cameraWorldPos);
		}

		// Get object position in local space
		localObjectPos.copy(groupRef.current.position);

		// Calculate direction from object to camera in local space
		directionToCamera.subVectors(localCameraPos, localObjectPos).normalize();

		// Store original rotation values for locked axes
		originalRotation.copy(groupRef.current.rotation);

		groupRef.current.rotation.y = Math.atan2(directionToCamera.x, directionToCamera.z);

		// Restore locked axes to their original values
		groupRef.current.rotation.x = originalRotation.x;
		groupRef.current.rotation.z = originalRotation.z;
	});

	const finalRef = useMergedRef(ref, groupRef);

	if (!furnitureId) return null;

	return <CollisionModel furnitureId={furnitureId} pointerEvents="none" ref={finalRef} colorWrite={true} />;
});
