import { Mesh } from "three";
import { useEnvironmentContext } from "../Environment";
import { useCallback, useEffect, useRef } from "react";
import { ThreeEvent, useThree } from "@react-three/fiber";
import { CeilingLight } from "./CeilingLight";
import { useLightStore } from "@/stores/lightStore";
import { useState } from "react";
import { useStageStore } from "@/stores/stageStore";


export function getLightColor(kelvin: number): string {
    const clampedKelvin = Math.max(1.5, Math.min(10, kelvin));


    let temperature = clampedKelvin * 10;

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
    return `#${((1 << 24) + (Math.round(red) << 16) + (Math.round(green) << 8) + Math.round(blue))
        .toString(16)
        .slice(1)
        .toUpperCase()}`;
}

export const RoomLighting = () => {
    const {planeMeshes} = useEnvironmentContext();
    const ceilingPlanes = planeMeshes['ceiling'];
    const meshRef = useRef<Mesh>(null);
    const {lightDetails, setLightDetails, globalIntensity, globalColor} = useLightStore();
    const {mode} = useStageStore();
    const [editable, setEditable] = useState(mode === 'lighting');
    const [ intensity, setIntensity] = useState<number>(globalIntensity);
    const [ color, setColor] = useState<number>(globalColor);
    const {gl} = useThree();

    useEffect(() => {
        setIntensity(globalIntensity);
    }, [globalIntensity]);

    useEffect(() => {
        setColor(globalColor);
    }, [globalColor]);

    useEffect(() => {
        setEditable(mode === 'lighting');
    }, [mode]);

    useEffect(() => {
        if (!ceilingPlanes || ceilingPlanes.length === 0) return;
        const ceilingPlane = ceilingPlanes[0];
        if (!ceilingPlane) return;
        
        setTimeout(() => {
            if (!meshRef.current) return;
            ceilingPlane.getWorldPosition(meshRef.current.position);
            meshRef.current.position.y -= 0.01;
        }, 100);
        
        
    }, [ceilingPlanes]);



    const handleClick = useCallback((event: ThreeEvent<PointerEvent>) => {
        if (!editable) return;
        const light = {
            position: event.point,
            // intensity: 0.8,
            // color: 2.7,
        };
        lightDetails[new Date().getTime().toString()] = light;

        setLightDetails(lightDetails);
    }, [editable]);


    return (
        <group>
            <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]} onClick={handleClick}>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial transparent={true} colorWrite={false}/>
            </mesh>
            <ambientLight intensity={0.1} color={getLightColor(2.7)} />
            {Object.entries(lightDetails).map(([id, light]) => {
                gl.shadowMap.needsUpdate = true;
                return (
                    <CeilingLight key={id} id={id} position={light.position} intensity={intensity} color={getLightColor(color)} />
                )
            })}
        </group>
    )
}