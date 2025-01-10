import { useXRPlanes, XRSpace, XRPlaneModel } from "@react-three/xr";
import { createContext, useContext } from "react";
import { DoubleSide, Mesh } from "three";

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
                                renderOrder={ plane.semanticLabel !== 'floor' ? 0 : undefined }
                                ref={(mesh: Mesh | null) => {
                                    if (mesh) {                                        
                                        planeMeshes[label].push(mesh);
                                    }
                                }}
                                plane={plane}
                            >
                                <meshBasicMaterial transparent={plane.semanticLabel !== 'floor' ? false : true } opacity={plane.semanticLabel !== 'floor' ? 1 : 0} colorWrite={false} side={DoubleSide} />
                            </XRPlaneModel>
                        </XRSpace>
                    );
                })}
                {children}
            </group>
        </EnvironmentContext.Provider>
    );
};