import { useGlobalLighting, useLightPlacementIds } from '@/stores/roomStore';
import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Group } from 'three';
import { CeilingLight } from './CeilingLight';
import { ShadowLight, ShadowLightTarget } from './ShadowLight';
import { colorObjectToHextString, getLightColorObject } from './getLightColor';

export const RoomLighting = () => {
	const lightIds = useLightPlacementIds();

	const targetRef = useRef<Group>(null);

	// set clear color to a darkened version of the lighting color
	const [{ color, intensity }] = useGlobalLighting();
	const gl = useThree((s) => s.gl);
	useEffect(() => {
		const baseColor = getLightColorObject(color);
		baseColor.r *= 0.5;
		baseColor.g *= 0.5;
		baseColor.b *= 0.5;
		gl.setClearColor(colorObjectToHextString(baseColor), 1);
	}, [gl, color, intensity]);

	return (
		<>
			<ShadowLightTarget targetRef={targetRef} />
			<ShadowLight target={targetRef.current} />
			{lightIds.map((id) => {
				return <CeilingLight key={id} id={id} />;
			})}
		</>
	);
};
