import { PlaneAnchor } from "@/components/xr/anchors"
import { SnapAnchor } from "@/components/xr/anchors/SnapAnchor";
import { Gltf } from "@react-three/drei"
import { forwardRef } from 'react';

export const Bedroom = forwardRef(() => {
	return (
        <>
            <PlaneAnchor label="floor">
                    <Gltf src="./assets/bedroom/rug.glb" position={[0, 0.01, 0]}/>

                <SnapAnchor label="wall" padding={0}>
                    <Gltf src="./assets/bedroom/dresser.glb" rotation={[0, Math.PI, 0]} />
                </SnapAnchor>

                <SnapAnchor label="wall" padding={1}>
                    <Gltf src="./assets/bedroom/bed.glb"/>
                    {/* <mesh>
                        <boxGeometry args={[0.7, 0.3, 0.3]} />
                        <meshBasicMaterial color="red" />
                    </mesh> */}
                </SnapAnchor>
            </PlaneAnchor>
        </>
    )
})