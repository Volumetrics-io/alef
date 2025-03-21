import { useFurnitureModel } from '@/services/publicApi/furnitureHooks';
import { useIsEditorStageMode, useSelectedModelId, useSetPanelState, useSetSelectedModelId } from '@/stores/editorStore';
import { useAddFurniture, usePrimaryFloorPlane } from '@/stores/roomStore';
import { PrefixedId } from '@alef/common';
import { useMergedRef } from '@alef/sys';
import { useFrame, useThree } from '@react-three/fiber';
import { forwardRef, useEffect, useRef } from 'react';
import { Euler, Group, Quaternion, Vector3 } from 'three';
import { PlanePlacement } from '../anchors/PlanePlacement';
import { getGlobalTransform } from '../userData/globalRoot';
import { CollisionModel } from './FurnitureModel';

export const SpawnFurniture = () => {
	const enabled = useIsEditorStageMode('furniture');
	const selectedModelId = useSelectedModelId();
	const setSelectedModelId = useSetSelectedModelId();
	const setPanelState = useSetPanelState();
	// detect primary floor, its origin length should be very small
	const primaryFloor = usePrimaryFloorPlane() ?? {
		id: 'rp-default-floor',
		origin: { x: 0, y: 0, z: 0 },
		extents: [10, 10],
		orientation: { x: 0, y: 0, z: 0, w: 1 },
		label: 'floor',
	};

	const modelRef = useRef<Group>(null);

	const addFurniture = useAddFurniture();

	const addFurnitureAtPoint = () => {
		if (!selectedModelId) return;
		const model = modelRef.current;
		if (!model) return;

		const orientation = new Quaternion();
		const position = new Vector3();

		const globalTransform = getGlobalTransform(model);
		globalTransform.decompose(position, orientation, new Vector3());

		addFurniture({
			furnitureId: selectedModelId,
			position: {
				x: position.x,
				// hardcode y = 0
				y: 0,
				z: position.z,
			},
			rotation: {
				x: orientation.x,
				y: orientation.y,
				z: orientation.z,
				w: orientation.w,
			},
		});
		setSelectedModelId(null);
		setPanelState('hidden');
	};

	return (
		<PlanePlacement onPlace={addFurnitureAtPoint} plane={primaryFloor} enabled={enabled && !!selectedModelId}>
			<GhostModel furnitureId={selectedModelId} ref={modelRef} />
		</PlanePlacement>
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
