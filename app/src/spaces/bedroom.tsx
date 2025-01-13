import { PlaneAnchor } from "@/components/xr/anchors"
import { SnapAnchor } from "@/components/xr/anchors/SnapAnchor";
import { Gltf } from "@react-three/drei"
import { forwardRef } from 'react';

export const Bedroom = forwardRef(() => {
	return (
        <>
            <PlaneAnchor label="floor">
                    <Gltf src="./assets/bedroom/rug.glb" receiveShadow  position={[0, 0.0, 0]}/>

                <SnapAnchor label="wall" padding={1}>
                    <Gltf src="./assets/bedroom/dresser.glb" position={[0, 0, -0.1]} castShadow receiveShadow rotation={[0, Math.PI, 0]} />
                </SnapAnchor>

                <SnapAnchor label="wall" padding={1}> */}
                    {/* <Gltf castShadow receiveShadow src="./assets/bedroom/bed.glb"/> */}
                    {/* {<mesh position={[0, 0.5, 0]} castShadow receiveShadow>
                        <boxGeometry args={[0.7, 0.3, 0.3]} />
                        <meshBasicMaterial color="red" />
                    </mesh> */}
                </SnapAnchor>
            </PlaneAnchor>
        </>
    )
})