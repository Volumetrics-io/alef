import { useLights, useGlobalLighting } from '@/stores/roomStore';
import { getLightColor } from './getLightColor';
import { Vector3, Group, Object3D } from 'three';
import { useEffect } from 'react';
import { useShadowMapUpdate } from '@/hooks/useShadowMapUpdate';

// Component to create a target for the shadow light
export const ShadowLightTarget = ({ targetRef }: { targetRef: React.RefObject<Group> }) => {
	return <group ref={targetRef}></group>;
};

export const ShadowLight = ({ target }: { target?: Object3D | null }) => {
	const lights = useLights();
	const [{ intensity: globalIntensity, color: globalColor }] = useGlobalLighting();
	const updateShadowMap = useShadowMapUpdate();
	const averageLightPosition = new Vector3();

	// Count the actual valid lights
	const validLights = Object.values(lights).filter((light) => !!light);
	const lightCount = validLights.length;

	if (lightCount > 0) {
		for (const light of validLights) {
			averageLightPosition.x += light.position.x;
			averageLightPosition.y += light.position.y;
			averageLightPosition.z += light.position.z;
		}
		averageLightPosition.divideScalar(lightCount);
	}

	useEffect(() => {
		updateShadowMap();
	}, [averageLightPosition]);

	// Calculate shadow radius based on light count
	// - Minimum radius: 0.5 (with 1 light, harder shadows)
	// - Increases with more lights (softer shadows with multiple sources)
	// - Uses square root to create diminishing returns (doesn't get too blurry too fast)
	// - Caps at ~3.0 with many lights to avoid over-blurring
	const baseRadius = 0.5; // Starting radius for a single light
	const radiusIncrement = 1.5; // How much each additional light contributes
	const shadowRadius = Math.min(5.0, baseRadius + radiusIncrement * Math.sqrt(Math.max(0, lightCount - 1)));

	// Calculate shadow camera size (width/height of the shadow area)
	// This controls how wide an area the shadows cover
	const baseShadowSize = 5; // Base size with one light
	const shadowSizeIncrement = 1.2; // How much each light expands the shadow area
	// Increase shadow camera size with more lights, with diminishing returns
	const shadowCameraSize = baseShadowSize + shadowSizeIncrement * Math.log(lightCount + 1);

	return (
		<directionalLight
			position={averageLightPosition.toArray()}
			intensity={globalIntensity}
			color={getLightColor(globalColor)}
			castShadow={true}
			shadow-mapSize-width={2048}
			shadow-mapSize-height={2048}
			shadow-camera-far={5}
			shadow-camera-left={-shadowCameraSize}
			shadow-camera-right={shadowCameraSize}
			shadow-camera-top={shadowCameraSize}
			shadow-camera-bottom={-shadowCameraSize}
			shadow-bias={0.000008}
			shadow-normalBias={0.013}
			shadow-radius={shadowRadius}
			target={target || undefined}
		/>
	);
};
