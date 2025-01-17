import { Mesh, Vector3 } from "three";
import { useEnvironmentContext } from "../Environment";
import { useCallback, useEffect, useRef } from "react";
import { SpotLightProps, ThreeEvent, useThree } from "@react-three/fiber";
import { create } from "zustand";

type LightDetails = {
    position: Vector3;
    intensity: number;
    color: string;
}

type LightDetailsStore = {
    lightDetails: LightDetails[];
    setLightDetails: (lightDetails: LightDetails[]) => void;
}

const useLightStore = create<LightDetailsStore>((set) => {
    return {
        lightDetails: [],
        setLightDetails: (lightDetails: LightDetails[]) => set({ lightDetails }),
    }
});

const getWarmLightVariation = (baseColor: string = '#FFE5B7') => {
    // Convert hex to HSL for easier manipulation
    const rgb2hsl = (hex: string): [number, number, number] => {
        // Remove # if present
        hex = hex.replace('#', '');
        
        // Convert hex to RGB
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [h * 360, s * 100, l * 100];
    };

    // Get base HSL values
    const [baseH, baseS, baseL] = rgb2hsl(baseColor);
    
    // Create subtle variations
    const hue = baseH + (Math.random() * 10 - 5);        // ±5 degrees
    const saturation = baseS + (Math.random() * 10 - 5); // ±5%
    const lightness = baseL + (Math.random() * 6 - 3);   // ±3%

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

export const RoomLighting = () => {
    const {planeMeshes} = useEnvironmentContext();
    const ceilingPlanes = planeMeshes['ceiling'];
    const meshRef = useRef<Mesh>(null);
    const {lightDetails, setLightDetails} = useLightStore();
    const {gl} = useThree();

    useEffect(() => {
        if (!ceilingPlanes || ceilingPlanes.length === 0) return;
        const ceilingPlane = ceilingPlanes[0];
        if (!ceilingPlane) return;
        
        setTimeout(() => {
            if (!meshRef.current) return;
            ceilingPlane.getWorldPosition(meshRef.current.position);
        }, 100);
        
        
    }, [ceilingPlanes]);



    const handleClick = useCallback((event: ThreeEvent<PointerEvent>) => {
        const light = {
            position: event.point,
            intensity: 0.8,
            // You can change this base color as needed
            color: getWarmLightVariation('#FFE5B7'), // Warm white (2700K)
        };
        lightDetails.push(light);
        setLightDetails(lightDetails);
    }, []);


    return (
        <group>
            <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]} onPointerUp={handleClick}>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial transparent={true} colorWrite={false}/>
            </mesh>
            <ambientLight intensity={0.1} color={getWarmLightVariation('#FFE5B7')} />
            {lightDetails.map((light, index) => {
                gl.shadowMap.needsUpdate = true;
                return (
                    <CeilingLight key={index} {...light} />
                )
            })}
        </group>
    )
}


export const CeilingLight = ({...props}: SpotLightProps) => {
    return (
        <group>
            <mesh position={props.position}>
                <sphereGeometry args={[0.1, 32, 32]} />
                <meshBasicMaterial color="yellow" transparent={true} opacity={0.5} />
            </mesh>
            <spotLight 
                castShadow={true}
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-far={10}
                shadow-bias={0.000008}
                shadow-normalBias={0.013}
                angle={Math.PI / 2.5}        // 60 degrees spread
                penumbra={0.2}               // Soft edges
                decay={0.5}                  // Physical light falloff
                distance={20}              // Maximum range
                position={props.position}
                intensity={props.intensity} // Compensate for directional nature
                {...props}
            />
        </group>
    )
}