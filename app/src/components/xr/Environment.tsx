import { RigidBody } from '@react-three/rapier';
import { useXRPlanes, XRPlaneModel, XRSpace } from '@react-three/xr';
import { createContext, useContext, useState } from 'react';
import { DoubleSide, Mesh } from 'three';

type PlaneMeshes = {
	[label: string]: Mesh[];
};

interface EnvironmentContextType {
	planeMeshes: PlaneMeshes;
	sunlightIntensity: number;
	setSunlightIntensity: (intensity: number) => void;
}

export const EnvironmentContext = createContext<EnvironmentContextType>({
	planeMeshes: {},
	sunlightIntensity: 1,
	setSunlightIntensity: () => {},
});

export const useEnvironmentContext = () => {
	return useContext(EnvironmentContext);
};

export const Environment = ({ children }: { children: React.ReactNode }) => {
	const planes = useXRPlanes();
	const planeMeshes: PlaneMeshes = {};
	const [sunlightIntensity, setSunlightIntensity] = useState<number>(1);

	return (
		<EnvironmentContext.Provider value={{ planeMeshes, sunlightIntensity, setSunlightIntensity }}>
			<group>
				{planes.map((plane, index) => {
					const label = plane.semanticLabel ?? 'other';
					if (!planeMeshes[label]) {
						planeMeshes[label] = [];
					}

					// const halfExtents = [
					// 	Math.abs(plane.polygon[0].x - plane.polygon[1].x) / 2,
					// 	Math.abs(plane.polygon[0].y - plane.polygon[1].y) / 2,
					// 	// arbitrary depth
					// 	0.01,
					// ] satisfies CuboidArgs;

					return (
						<XRSpace key={label + index} space={plane.planeSpace}>
							<XRPlaneModel renderOrder={-1} plane={plane} receiveShadow={true}>
								<shadowMaterial side={DoubleSide} shadowSide={DoubleSide} transparent={true} opacity={0.6 * sunlightIntensity} />
							</XRPlaneModel>
							<RigidBody type="fixed" colliders="cuboid">
								{/* <CuboidCollider args={halfExtents} /> */}
								<XRPlaneModel
									ref={(mesh: Mesh | null) => {
										if (mesh) {
											planeMeshes[label].push(mesh);
										}
									}}
									renderOrder={-1}
									plane={plane}
									position={[0, 0.01, 0]}
								>
									<meshBasicMaterial colorWrite={false} side={DoubleSide} />
								</XRPlaneModel>
							</RigidBody>
						</XRSpace>
					);
				})}
				{children}
			</group>
		</EnvironmentContext.Provider>
	);
};
