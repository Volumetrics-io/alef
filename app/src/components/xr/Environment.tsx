import { useXRPlanes, XRSpace, XRPlaneModel } from "@react-three/xr";
import { createContext, useContext } from "react";
import { DoubleSide, FrontSide, Mesh } from "three";

type PlaneMeshes = {
    [label: string]: Mesh[]
};

export const EnvironmentContext = createContext<PlaneMeshes>({});

export const useEnvironmentContext = () => {
    return useContext(EnvironmentContext);
}

export const Environment = ({ children }: { children: React.ReactNode }) => {
    const planes = useXRPlanes();
    const planeMeshes: PlaneMeshes = {};
    
    return (
        <EnvironmentContext.Provider value={planeMeshes}>
            <group>
                {planes.map((plane, index) => {
                    const label = plane.semanticLabel ?? 'other';
                    if (!planeMeshes[label]) {
                        planeMeshes[label] = [];
                    }
                    
                    return (
                        <XRSpace key={label + index} space={plane.planeSpace}>
                            <XRPlaneModel 
                                renderOrder={ -1 }
                                ref={(mesh: Mesh | null) => {
                                    if (mesh) {                                        
                                        planeMeshes[label].push(mesh);
                                    }
                                }}
                                plane={plane}
                                receiveShadow={true}
                            >
                                <shadowMaterial 
                                side={DoubleSide} 
                                shadowSide={FrontSide}
                                transparent={true}
                                opacity={0.5}
                                />
                            </XRPlaneModel>
                            <XRPlaneModel 
                                renderOrder={ -1 }
                                plane={plane}
                            >
                                <meshBasicMaterial 
                                colorWrite={false} 
                                side={DoubleSide} 
                                />
                            </XRPlaneModel>
                        </XRSpace>
                    );
                })}
                {children}
            </group>
        </EnvironmentContext.Provider>
    );
};