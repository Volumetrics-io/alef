import { useLightStore } from '@/stores/lightStore';
import { useStageStore } from '@/stores/stageStore';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { useXR, useXRPlanes } from '@react-three/xr';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Mesh } from 'three';
import { CeilingLight } from './CeilingLight';

function getLightColor(kelvin: number): string {
	const clampedKelvin = Math.max(1.5, Math.min(10, kelvin));
	const temperature = clampedKelvin * 10;

	// Calculate red
	let red: number;
	if (temperature <= 66) {
		red = 255;
	} else {
		red = temperature - 60;
		red = 329.698727446 * Math.pow(red, -0.1332047592);
		red = Math.max(0, Math.min(255, red));
	}

	// Calculate green
	let green: number;
	if (temperature <= 66) {
		green = 99.4708025861 * Math.log(temperature) - 161.1195681661;
	} else {
		green = temperature - 60;
		green = 288.1221695283 * Math.pow(green, -0.0755148492);
	}
	green = Math.max(0, Math.min(255, green));

	// Calculate blue
	let blue: number;
	if (temperature >= 66) {
		blue = 255;
	} else {
		if (temperature <= 19) {
			blue = 0;
		} else {
			blue = temperature - 10;
			blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
			blue = Math.max(0, Math.min(255, blue));
		}
	}

	// Convert RGB to hexadecimal format
	return `#${((1 << 24) + (Math.round(red) << 16) + (Math.round(green) << 8) + Math.round(blue)).toString(16).slice(1).toUpperCase()}`;
}

export const RoomLighting = () => {
	const ceilingPlanes = useXRPlanes('ceiling');
	const ceilingPlane = ceilingPlanes[0];
	const meshRef = useRef<Mesh>(null);
	const { lightDetails, setLightDetails, globalIntensity, globalColor } = useLightStore();
	const { mode } = useStageStore();
	const [editable, setEditable] = useState(mode === 'lighting');
	const [intensity, setIntensity] = useState<number>(globalIntensity);
	const [color, setColor] = useState<number>(globalColor);
	const { gl } = useThree();

	useEffect(() => {
		setIntensity(globalIntensity);
	}, [globalIntensity]);

	useEffect(() => {
		setColor(globalColor);
	}, [globalColor]);

	useEffect(() => {
		setEditable(mode === 'lighting');
	}, [mode]);

	const { originReferenceSpace } = useXR();

	useFrame((_s, _d, frame: XRFrame) => {
		if (!ceilingPlane) return;
		if (!originReferenceSpace) return;
		if (!meshRef.current) return;
		// set the height of the plane to the height of the XR ceiling plane used.
		const pose = frame.getPose(ceilingPlane.planeSpace, originReferenceSpace);
		const y = pose?.transform.position?.y;
		if (y !== undefined) {
			meshRef.current.position.y = y;
		}
	});

	const handleClick = useCallback(
		(event: ThreeEvent<MouseEvent>) => {
			if (!editable) return;
			const light = {
				position: event.point,
				// intensity: 0.8,
				// color: 2.7,
			};

			setLightDetails({
				...lightDetails,
				[crypto.randomUUID()]: light,
			});
		},
		[editable, lightDetails, setLightDetails]
	);

	return (
		<group>
			<mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]} onClick={handleClick}>
				<planeGeometry args={[100, 100]} />
				<meshStandardMaterial transparent={true} colorWrite={false} />
			</mesh>
			<ambientLight intensity={0.1} color={getLightColor(2.7)} />
			{Object.entries(lightDetails).map(([id, light]) => {
				gl.shadowMap.needsUpdate = true;
				return <CeilingLight key={id} id={id} position={light.position} intensity={intensity} color={getLightColor(color)} />;
			})}
		</group>
	);
};
