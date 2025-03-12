import { useIsEditorStageMode } from '@/stores/editorStore';
import { useAddLight, useGlobalLighting, useLightPlacementIds, usePlanes } from '@/stores/roomStore';
import { useFrame } from '@react-three/fiber';
import { useXR } from '@react-three/xr';
import { useCallback, useEffect, useRef } from 'react';
import { Group, Vector3 } from 'three';
import { CeilingLight } from './CeilingLight';
import { getLightColor } from './getLightColor';
import { ShadowLight, ShadowLightTarget } from './ShadowLight';
const DEFAULT_CEILING_HEIGHT = 3;

export const RoomLighting = () => {
	const ceilingPlanes = usePlanes((p) => p.label === 'ceiling');
	const xrCeilingPlane = ceilingPlanes[0];

	const meshRef = useRef<Group>(null);
	const addLight = useAddLight();
	const lightIds = useLightPlacementIds();
	const [{ intensity: globalIntensity, color: globalColor }] = useGlobalLighting();
	const editable = useIsEditorStageMode('lighting');

	const { originReferenceSpace } = useXR();

	useFrame((_s, _d, frame: XRFrame) => {
		if (!xrCeilingPlane) return;
		if (!originReferenceSpace) return;
		if (!meshRef.current) return;
		if (!frame) return;
		// set the height of the plane to the height of the XR ceiling plane used.
		const y = -xrCeilingPlane.origin.y;
		if (y !== undefined) {
			meshRef.current.position.y = y;
		} else {
			meshRef.current.position.y = DEFAULT_CEILING_HEIGHT;
		}
	});

	useEffect(() => {
		if (!meshRef.current) return;
		meshRef.current.position.y = DEFAULT_CEILING_HEIGHT;
	}, [meshRef]);

	const handleClick = useCallback(
		(event: any) => {
			if (!editable) return;
			const position = new Vector3(event.localPoint.x, event.localPoint.y, event.localPoint.z);

			const light = {
				position,
			};

			addLight(light);
		},
		[editable, addLight]
	);

	const targetRef = useRef<Group>(null);

	return (
		<>
			<group rotation={[Math.PI / 2, 0, 0]} ref={meshRef}>
				<mesh onClick={handleClick}>
					<planeGeometry args={[xrCeilingPlane.extents[0], xrCeilingPlane.extents[1]]} />
					<meshStandardMaterial transparent={false} colorWrite={false} color="red" />
				</mesh>
				<ambientLight intensity={globalIntensity * 0.3} color={getLightColor(globalColor)} />
				{/* {lightIds.length === 0 && <pointLight intensity={globalIntensity * 10} color={getLightColor(globalColor)} />} */}
				{lightIds.map((id) => {
					return <CeilingLight key={id} id={id} />;
				})}
				<ShadowLight target={targetRef.current} />
			</group>
			<ShadowLightTarget targetRef={targetRef} />
		</>
	);
};
