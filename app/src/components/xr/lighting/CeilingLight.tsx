import { useLightStore } from "@/stores/lightStore";
import { useStageStore } from "@/stores/stageStore";
import { SpotLightProps, ThreeEvent } from "@react-three/fiber";
import { useRef } from "react";
import { useEffect, useCallback, useState } from "react";
import { Group, Vector3 } from "three";

export const CeilingLight = ({id, ...props}: {id: string} & SpotLightProps) => {
    const {selectedLightId, setSelectedLightId, hoveredLightId, setHoveredLightId, setLightPosition } = useLightStore();
    const {mode} = useStageStore();
    const [editable, setEditable] = useState<boolean>(mode === 'lighting');
    const [selected, setSelected] = useState<boolean>(false);
    const [hovered, setHovered] = useState<boolean>(false);
    const dragRef = useRef<boolean>(false);
    const groupRef = useRef<Group>(null);
    const lastPointerPosition = useRef<Vector3>(new Vector3());
    const currentPointerPosition = useRef<Vector3>(new Vector3());
    const delta = useRef<Vector3>(new Vector3());

    useEffect(() => {
        setEditable(mode === 'lighting');
    }, [mode]);

    useEffect(() => {
        setSelected(selectedLightId === id);
    }, [selectedLightId]);

    useEffect(() => {
        setHovered(hoveredLightId === id);
    }, [hoveredLightId]);

    const handleClick = () => {
        if (!editable) return;
        setSelectedLightId(id);
    }

    const handleHover = useCallback(() => {
        if (!editable) return;
        setHoveredLightId(id);
    }, [editable]);

    const handleHoverLeave = useCallback(() => {
        if (!editable) return;
        setHoveredLightId(null);
    }, [editable]);

    const handlePointerDown = useCallback((event: ThreeEvent<PointerEvent>) => {
        if (!editable) return;
        dragRef.current = true;
        lastPointerPosition.current.copy(event.point);
    }, [editable]);

    const handlePointerUp = useCallback(() => {
        if (!editable) return;
        dragRef.current = false;
        lastPointerPosition.current.set(0, 0, 0);
    }, [editable]);

    const handlePointerMove = useCallback((event: ThreeEvent<PointerEvent>) => {
        if (!props.position) return;
        if (!groupRef.current) return;
        if (dragRef.current) {
            currentPointerPosition.current.copy(event.point);
            delta.current.subVectors(currentPointerPosition.current, lastPointerPosition.current);
            lastPointerPosition.current.copy(currentPointerPosition.current);
            const distanceFromStart = groupRef.current.position.distanceTo(currentPointerPosition.current);

            const scaleFactor = 1 + distanceFromStart * 0.5;
            delta.current.multiplyScalar(scaleFactor);
            delta.current.y = 0;
            groupRef.current.position.add(delta.current);
            setLightPosition(id, groupRef.current.position);
        }
    }, []);

    return (
        <group ref={groupRef} position={props.position} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp} onPointerMove={handlePointerMove}>
            {editable && (
                <group>
                    <mesh position={[0, -0.01, 0]} visible={hovered || selected} rotation={[Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[0.125, 0.16, 32]} />
                        <meshBasicMaterial color="white" />
                    </mesh>
                    <mesh onClick={handleClick} onPointerOver={handleHover} onPointerOut={handleHoverLeave}>
                        <sphereGeometry args={[0.1, 32, 32]} />
                        <meshBasicMaterial color={props.color} transparent={true} opacity={props.intensity} />
                    </mesh>
                </group>
            )}
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
                position={[0,0,0]}
                intensity={props.intensity} // Compensate for directional nature
                color={props.color}
                {...props}
            />
        </group>
    )
}