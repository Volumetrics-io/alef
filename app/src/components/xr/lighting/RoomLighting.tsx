import { useLightStore } from '@/stores/lightStore';
import { useStageStore } from '@/stores/stageStore';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { useXR, useXRPlanes } from '@react-three/xr';
import { useCallback, useRef } from 'react';
import { Mesh } from 'three';
import { useShallow } from 'zustand/react/shallow';
import { CeilingLight } from './CeilingLight';
import { getLightColor } from './getLightColor';

export const RoomLighting = () => {
	const ceilingPlanes = useXRPlanes('ceiling');
	const ceilingPlane = ceilingPlanes[0];
	const meshRef = useRef<Mesh>(null);
	const addLight = useLightStore((s) => s.addLight);
	const lightIds = useLightStore(useShallow((s) => Object.keys(s.lightDetails)));
	const editable = useStageStore((s) => s.mode === 'lighting');
	const { gl } = useThree();

	const { originReferenceSpace } = useXR();

	useFrame((_s, _d, frame: XRFrame) => {
		if (!ceilingPlane) return;
		if (!originReferenceSpace) return;
		if (!meshRef.current) return;
		if (!frame) return;
		// set the height of the plane to the height of the XR ceiling plane used.
		const pose = frame.getPose(ceilingPlane.planeSpace, originReferenceSpace);
		const y = pose?.transform.position?.y;
		if (y !== undefined) {
			console.log('ceiling height', y);
			meshRef.current.position.y = y;
		}
	});

	const handleClick = useCallback(
		(event: ThreeEvent<MouseEvent>) => {
			if (!editable) return;
			const light = {
				position: event.point,
			};

			addLight(light);
		},
		[editable, addLight]
	);

	return (
		<group>
			<mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]} onClick={handleClick}>
				<planeGeometry args={[100, 100]} />
				<meshStandardMaterial transparent={false} colorWrite={true} color="red" />
			</mesh>
			<ambientLight intensity={0.1} color={getLightColor(2.7)} />
			{lightIds.map((id) => {
				gl.shadowMap.needsUpdate = true;
				return <CeilingLight key={id} id={id} />;
			})}
		</group>
	);
};
