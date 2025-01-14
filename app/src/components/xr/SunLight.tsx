import { useThree } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';
import SunCalc from 'suncalc';
import { Object3D, Quaternion, Vector3 } from 'three';
import { useEnvironmentContext } from './Environment';

// Define the LightData type
interface LightData {
	directional: {
		position: [number, number, number];
		color: string;
		intensity: number;
	};
	ambient: {
		color: string;
		intensity: number;
	};
}

const updateSunData = (latitude: number, longitude: number): LightData => {
	const now = new Date();
	const sunPosition = SunCalc.getPosition(now, latitude, longitude);

	const altitude = sunPosition.altitude; // radians
	let azimuth = sunPosition.azimuth; // radians

	/**
	 * Adjust Azimuth:
	 * SunCalc's azimuth is measured from south, positive westward.
	 * Three.js typically uses azimuth from north, positive eastward.
	 * To convert, add π radians (180 degrees) to rotate the azimuth.
	 */
	// azimuth += Math.PI;

	// Normalize azimuth to be within [-π, π]
	if (azimuth > Math.PI) {
		azimuth -= 2 * Math.PI;
	}

	// Convert spherical coordinates to Cartesian coordinates
	const radius = 100; // Distance from the origin (adjust as needed)
	const x = radius * Math.cos(altitude) * Math.sin(azimuth);
	const y = radius * Math.sin(altitude);
	const z = radius * Math.cos(altitude) * Math.cos(azimuth);

	// Calculate light intensity based on altitude
	const normalizedAltitude = (altitude + Math.PI / 2) / Math.PI; // Normalize between 0 and 1
	const directionalIntensity = Math.max(0.2, normalizedAltitude); // Ensure a minimum intensity

	// Calculate light color based on altitude
	let directionalColor = '#ffffff'; // Default color
	if (normalizedAltitude < 0.3) {
		// Sunrise or sunset colors
		directionalColor = '#FF7E67'; // Warm orange
	} else if (normalizedAltitude < 0.6) {
		// Morning or evening
		directionalColor = '#FFD27F'; // Soft yellow
	} else {
		// Midday
		directionalColor = '#ffffff'; // Bright white
	}

	// Calculate ambient light intensity and color based on altitude
	let ambientIntensity = 0.3;
	let ambientColor = '#ffffff';

	if (normalizedAltitude < 0.3) {
		ambientIntensity = 0.5; // Brighter ambient light during sunrise/sunset
		ambientColor = '#FFB380'; // Warmer ambient color
	} else if (normalizedAltitude < 0.6) {
		ambientIntensity = 0.4; // Moderate ambient light during morning/evening
		ambientColor = '#FFE5A5'; // Softer ambient color
	} else {
		ambientIntensity = 0.3; // Standard ambient light during midday
		ambientColor = '#ffffff'; // Neutral ambient color
	}

	return {
		directional: {
			position: [x, y, z],
			color: directionalColor,
			intensity: directionalIntensity,
		},
		ambient: {
			color: ambientColor,
			intensity: ambientIntensity,
		},
	};
};

const fetchGeolocation = (): Promise<LightData> => {
	return new Promise((resolve) => {
		let sunData = updateSunData(0, 0);
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					const { latitude, longitude } = position.coords;
					sunData = updateSunData(latitude, longitude);
					resolve(sunData);
				},
				(error) => {
					console.error('Error fetching geolocation:', error);
					// Default to a preset location if geolocation fails
					sunData = updateSunData(0, 0);
					resolve(sunData);
				}
			);
		} else {
			console.error('Geolocation is not supported by this browser.');
			// Default to a preset location if geolocation is unavailable
			resolve(sunData);
		}
	});
};

const SunLight: React.FC = () => {
	const { scene } = useThree();
	const { planeMeshes } = useEnvironmentContext();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const lightTarget = useRef<Object3D>(new Object3D() as any);

	// Initialize lightData with the LightData type
	const [lightData, setLightData] = useState<LightData>({
		directional: {
			position: [0, 100, 0], // Initial position above the scene
			color: '#ffffff',
			intensity: 1,
		},
		ambient: {
			color: '#ffffff',
			intensity: 0.3,
		},
	});

	// Access the function to update sunlightIntensity from context
	const { setSunlightIntensity } = useEnvironmentContext();

	useEffect(() => {
		let isMounted = true; // To prevent state updates if component is unmounted

		// Function to update sun data
		const updateSunAndLight = async () => {
			const sunData = await fetchGeolocation();
			if (isMounted) {
				setLightData(sunData);
				setSunlightIntensity(sunData.directional.intensity);
			}

			if (planeMeshes && planeMeshes['window'] && planeMeshes['window'].length > 0) {
				const windows = planeMeshes['window'];
				const meshWorldPosition = new Vector3();
				const meshWorldQuaternion = new Quaternion();
				const forward = new Vector3(0, 0, 1); // Assuming forward is along Z axis

				const sumDirection = new Vector3(0, 0, 0);
				const sumPosition = new Vector3(0, 0, 0);

				// Calculate the sum of all window directions and positions
				windows.forEach((mesh) => {
					mesh.getWorldPosition(meshWorldPosition);
					mesh.getWorldQuaternion(meshWorldQuaternion);
					const direction = forward.clone().applyQuaternion(meshWorldQuaternion).normalize();
					sumDirection.add(direction);
					sumPosition.add(meshWorldPosition);
				});

				const count = windows.length;
				const avgDirection = sumDirection.divideScalar(count).normalize();
				const avgPos = sumPosition.divideScalar(count);

				const targetDistance = 50; // Adjust based on your scene scale
				lightTarget.current.position.copy(avgPos).add(avgDirection.multiplyScalar(targetDistance));
				scene.add(lightTarget.current);

				// Prioritize window positions by adjusting light data
				setLightData((prev) => {
					const newDirectionalPosition: [number, number, number] = [
						avgPos.x + prev.directional.position[0] * 0.2,
						avgPos.y + prev.directional.position[1] * 0.7,
						avgPos.z + prev.directional.position[2] * 0.2,
					];

					const newDirectionalIntensity = Math.min(0.75, count * 0.5);
					const newAmbientIntensity = Math.min(1, count * 0.2);

					// Check if there's an actual change to prevent unnecessary state updates
					const isDirectionalPositionChanged = !newDirectionalPosition.every((value, index) => value === prev.directional.position[index]);

					const isDirectionalIntensityChanged = newDirectionalIntensity !== prev.directional.intensity;
					const isAmbientIntensityChanged = newAmbientIntensity !== prev.ambient.intensity;

					if (!isDirectionalPositionChanged && !isDirectionalIntensityChanged && !isAmbientIntensityChanged) {
						return prev; // No changes needed
					}

					return {
						directional: {
							...prev.directional,
							position: newDirectionalPosition,
							intensity: newDirectionalIntensity,
						},
						ambient: {
							...prev.ambient,
							intensity: newAmbientIntensity,
						},
					};
				});
			}
		};

		// Set up interval to update sun data every minute
		const interval = setInterval(() => {
			updateSunAndLight();
		}, 60000); // Update every minute

		return () => {
			isMounted = false; // Cleanup flag
			clearInterval(interval);
		};
	}, [planeMeshes, scene, setSunlightIntensity]);

	return (
		<>
			<directionalLight
				position={lightData.directional.position}
				color={lightData.directional.color}
				intensity={lightData.directional.intensity}
				castShadow
				target={lightTarget.current}
				shadow-mapSize-width={4096}
				shadow-mapSize-height={4096}
				shadow-camera-far={500}
				shadow-bias={0.000008}
			/>
			<ambientLight intensity={lightData.ambient.intensity} color={lightData.ambient.color} />
		</>
	);
};

export default SunLight;
