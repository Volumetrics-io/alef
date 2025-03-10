import { AnimatedSurface, usePullAnimation } from '@/components/xr/ui/Animations';
import { Button } from '@/components/xr/ui/Button';
import { colors, getColorForAnimation } from '@/components/xr/ui/theme';
import { FurnitureItem } from '@/services/publicApi/furnitureHooks';
import { useAddFurniture, usePlanes } from '@/stores/roomStore';
import { config, useSpring } from '@react-spring/three';
import { useFrame } from '@react-three/fiber';
import { Container, Image } from '@react-three/uikit';
import { PlusIcon } from '@react-three/uikit-lucide';
import { useGetXRSpaceMatrix, useXR, useXRPlanes, useXRSpace } from '@react-three/xr';
import { useRef, useState } from 'react';
import { Matrix4, Vector3 } from 'three';

export function FurnitureSelectItem({ furnitureItem }: { furnitureItem: FurnitureItem }) {
	const [hovered, setHovered] = useState(0);

	const { spring } = useSpring({ spring: hovered, config: config.default });

	const transformTranslateZ = usePullAnimation(spring);

	const startBorderColor = getColorForAnimation(colors.border);
	const endBorderColor = getColorForAnimation(colors.faded);

	if (!startBorderColor || !endBorderColor) {
		return null;
	}

	const borderColor = spring.to([0, 1], [`#${startBorderColor.getHexString()}`, `#${endBorderColor.getHexString()}`]);

	const startBackgroundColor = getColorForAnimation(colors.surface);
	const endBackgroundColor = getColorForAnimation(colors.hover);

	if (!startBackgroundColor || !endBackgroundColor) {
		return null;
	}

	const backgroundColor = spring.to([0, 1], [`#${startBackgroundColor.getHexString()}`, `#${endBackgroundColor.getHexString()}`]);
	return (
		<AnimatedSurface
			transformTranslateZ={transformTranslateZ}
			borderColor={borderColor}
			backgroundColor={backgroundColor}
			height="48%"
			minWidth="32%"
			flexDirection="column"
			flexWrap="no-wrap"
			gap={3}
			flexShrink={0}
			alignItems="center"
			onHoverChange={(hovered) => setHovered(Number(hovered))}
		>
			<Container flexDirection="column" alignItems="center" justifyContent="center" backgroundColor={colors.paper} borderRadius={5} width="100%">
				{hovered && <FurnitureAddButton furnitureItem={furnitureItem} />}
				<Image src={`${import.meta.env.VITE_PUBLIC_API_ORIGIN}/furniture/${furnitureItem.id}/image.jpg`} width="100%" height="100%" objectFit="cover" />
			</Container>
		</AnimatedSurface>
	);
}

function FurnitureAddButton({ furnitureItem }: { furnitureItem: FurnitureItem }) {
	const addFurniture = useAddFurniture();

	const isInSession = useXR((s) => !!s.session);
	const viewerSpace = useXRSpace('head');
	const originSpace = useXR((s) => s.originReferenceSpace);
	const getViewerMatrix = useGetXRSpaceMatrix(viewerSpace);
	const xrFloors = useXRPlanes('floor');
	const savedFloors = usePlanes((p) => p.label === 'floor');

	const closestFloorPositionRef = useRef<Vector3>(new Vector3());

	// temp vars
	const tempVars = useRef({
		viewerPosition: new Vector3(),
		viewerMatrix: new Matrix4(),
		floorPosition: new Vector3(),
	});
	useFrame((state, __, xrFrame: XRFrame) => {
		// if in XR, we use the head position to determine viewer position
		// otherwise, we use the camera position
		const { viewerPosition, viewerMatrix, floorPosition } = tempVars.current;
		let gotViewer = false;
		if (isInSession && getViewerMatrix) {
			if (getViewerMatrix(viewerMatrix, xrFrame)) {
				viewerPosition.setFromMatrixPosition(viewerMatrix);
				gotViewer = true;
			}
		}
		if (!gotViewer) {
			// other attempts failed, use camera
			viewerPosition.copy(state.camera.position);
		}

		// in XR, we can use the XR detected floor planes to find the closest floor
		if (isInSession && xrFloors.length && originSpace) {
			// find the closest floor plane
			let closestDistance = Infinity;
			let pose: XRPose | undefined;
			for (const floor of xrFloors) {
				pose = xrFrame.getPose(floor.planeSpace, originSpace);
				if (!pose) {
					continue;
				}
				floorPosition.copy(pose.transform.position);
				const distance = viewerPosition.distanceTo(floorPosition);
				if (distance < closestDistance) {
					closestDistance = distance;
					closestFloorPositionRef.current.copy(floorPosition);
				}
			}
		} else if (savedFloors.length) {
			// outside XR, or if planes aren't detected, we can fall back to saved planes
			// from the room data.
			let closestDistance = Infinity;
			for (const floor of savedFloors) {
				floorPosition.set(floor.origin.x, floor.origin.y, floor.origin.z);
				const distance = viewerPosition.distanceTo(floorPosition);
				if (distance < closestDistance) {
					closestDistance = distance;
					closestFloorPositionRef.current.copy(floorPosition);
				}
			}
		} else {
			// we really have nothing to work with -- just use 0
			closestFloorPositionRef.current.set(0, 0, 0);
		}
	});

	const addFurnitureAtCenterOfFloorClosestToUser = () => {
		addFurniture({
			furnitureId: furnitureItem.id,
			position: closestFloorPositionRef.current,
			rotation: { x: 0, y: 0, z: 0, w: 1 },
		});
	};

	return (
		<Button
			variant="link"
			width={30}
			height={30}
			padding={4}
			zIndexOffset={10}
			positionType="absolute"
			positionBottom={6}
			positionRight={6}
			onClick={addFurnitureAtCenterOfFloorClosestToUser}
		>
			<PlusIcon />
		</Button>
	);
}
