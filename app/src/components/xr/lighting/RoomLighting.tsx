import { useIsEditorStageMode } from '@/stores/editorStore';
import { useAddLight, useGlobalLighting, useLightPlacementIds } from '@/stores/roomStore/roomStore';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { useXR, useXRPlanes } from '@react-three/xr';
import { useCallback, useRef } from 'react';
import { Mesh } from 'three';
import { CeilingLight } from './CeilingLight';
import { getLightColor } from './getLightColor';

const DEFAULT_CEILING_HEIGHT = 2.7;

export const RoomLighting = () => {
	const ceilingPlanes = useXRPlanes('ceiling');
	const xrCeilingPlane = ceilingPlanes[0];

	const meshRef = useRef<Mesh>(null);
	const addLight = useAddLight();
	const lightIds = useLightPlacementIds();
	const [{ intensity: globalIntensity, color: globalColor }] = useGlobalLighting();
	const editable = useIsEditorStageMode('lighting');
	const { gl } = useThree();

	const { originReferenceSpace, session } = useXR();

	useFrame((_s, _d, frame: XRFrame) => {
		if (!xrCeilingPlane) return;
		if (!originReferenceSpace) return;
		if (!meshRef.current) return;
		if (!frame) return;
		// set the height of the plane to the height of the XR ceiling plane used.
		const pose = frame.getPose(xrCeilingPlane.planeSpace, originReferenceSpace);
		const y = pose?.transform.position?.y;
		if (y !== undefined) {
			meshRef.current.position.y = y;
		} else {
			meshRef.current.position.y = DEFAULT_CEILING_HEIGHT;
		}
	});

	const handleClick = useCallback(
		(event: ThreeEvent<MouseEvent>) => {
			if (!editable) return;
			const light = {
				position: { x: event.point.x, y: event.point.y, z: event.point.z },
			};

			addLight(light);
		},
		[editable, addLight]
	);

	return (
		<group>
			<mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]} onClick={handleClick}>
				<planeGeometry args={[100, 100]} />
				<meshStandardMaterial transparent={false} colorWrite={false} color="red" />
			</mesh>
			<ambientLight intensity={globalIntensity * 0.2} color={getLightColor(globalColor)} />
			{lightIds.map((id) => {
				gl.shadowMap.needsUpdate = true;
				return <CeilingLight key={id} id={id} />;
			})}
		</group>
	);
};
