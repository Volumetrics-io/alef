import { useSetSunlightIntensity } from '@/stores/environmentStore';
import { useFrame, useThree } from '@react-three/fiber';
import { useXR, useXRPlanes } from '@react-three/xr';
import React, { useEffect, useRef } from 'react';
import SunCalc from 'suncalc';
import { AmbientLight, DirectionalLight, Object3D, Quaternion, Vector3 } from 'three';
import { useGeoStore } from '../../../stores/geoStore';

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

// Function to calculate sun data based on latitude and longitude
const calculateSunData = (latitude: number, longitude: number): LightData => {
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
	const radius = 10; // Distance from the origin (adjust as needed)
	const x = radius * Math.cos(altitude) * Math.sin(azimuth);
	const y = radius * Math.sin(altitude);
	const z = -radius * Math.cos(altitude) * Math.cos(azimuth);

	// Calculate light intensity based on altitude
	const normalizedAltitude = (altitude + Math.PI / 2) / Math.PI; // Normalize between 0 and 1
	const directionalIntensity = Math.max(0.5, normalizedAltitude); // Ensure a minimum intensity

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

const SunLight: React.FC = () => {
	const { scene, gl } = useThree();
	const lightTarget = useRef<Object3D>(null);
	const {
		position: { latitude, longitude },
		error,
	} = useGeoStore();
	const windowPlanes = useXRPlanes('window');

	// Refs for light objects
	const directionalLightRef = useRef<DirectionalLight>(null);
	const ambientLightRef = useRef<AmbientLight>(null);

	// Ref to track elapsed time
	const elapsedTimeRef = useRef<number>(0);

	const setSunlightIntensity = useSetSunlightIntensity();

	// Initialize the target object in the scene
	useEffect(() => {
		if (lightTarget.current) {
			scene.add(lightTarget.current);
			return () => {
				if (!lightTarget.current) return;
				scene.remove(lightTarget.current);
			};
		}
	}, [scene]);

	const { originReferenceSpace } = useXR();
	useFrame((_, delta, frame: XRFrame) => {
		// Accumulate elapsed time
		elapsedTimeRef.current += delta;

		// Check if 60 seconds have passed
		if (elapsedTimeRef.current < 10) {
			return; // Exit early if not enough time has passed
		}

		// Reset elapsed time
		elapsedTimeRef.current = 0;

		if (error) {
			console.warn('Geolocation error:', error);
			return;
		}

		if (!latitude || !longitude) {
			console.warn('Latitude or Longitude is missing.');
			return;
		}

		const sunData = calculateSunData(latitude, longitude);

		if (windowPlanes.length > 0 && originReferenceSpace) {
			const meshWorldPosition = new Vector3();
			const meshWorldQuaternion = new Quaternion();
			const forward = new Vector3(0, 0, 1); // Assuming forward is along Z axis

			const sumDirection = new Vector3(0, 0, 0);
			const sumPosition = new Vector3(0, 0, 0);

			// Calculate the sum of all window directions and positions
			windowPlanes.forEach((plane) => {
				const pose = frame.getPose(plane.planeSpace, originReferenceSpace);
				if (pose) {
					meshWorldPosition.copy(pose.transform.position);
					meshWorldQuaternion.copy(pose.transform.orientation);
					const direction = forward.clone().applyQuaternion(meshWorldQuaternion).normalize();
					sumDirection.add(direction);
					sumPosition.add(meshWorldPosition);
				}
			});

			const count = windowPlanes.length;
			const avgPos = sumPosition.divideScalar(count);

			// Compute direction vector based on sun position and average window position
			const sunPos = new Vector3(...sunData.directional.position);
			const directionVector = new Vector3().subVectors(sunPos, avgPos).normalize();

			const targetDistance = 50; // Adjust based on your scene scale
			lightTarget.current?.position.copy(avgPos).add(directionVector.multiplyScalar(targetDistance));

			// Update directional light properties
			if (directionalLightRef.current) {
				directionalLightRef.current.position.set(...sunData.directional.position);
				directionalLightRef.current.color.set(sunData.directional.color);
				directionalLightRef.current.intensity = sunData.directional.intensity;
			}

			// Update ambient light properties
			if (ambientLightRef.current) {
				ambientLightRef.current.color.set(sunData.ambient.color);
				ambientLightRef.current.intensity = sunData.ambient.intensity;
			}

			// Update sunlight intensity in the context
			setSunlightIntensity(sunData.directional.intensity);

			// Ensure shadow map updates
			gl.shadowMap.needsUpdate = true;
		}
	});

	return (
		<>
			<object3D ref={lightTarget} />

			<directionalLight
				ref={directionalLightRef}
				position={[0, 100, 0]} // Initial position; will be updated by useFrame
				color="#ffffff" // Initial color
				intensity={1} // Initial intensity
				castShadow
				target={lightTarget.current!}
				shadow-mapSize-width={2048}
				shadow-mapSize-height={2048}
				shadow-camera-far={500}
				shadow-bias={0.000008}
			/>
			<ambientLight
				ref={ambientLightRef}
				intensity={0.3} // Initial intensity
				color="#ffffff" // Initial color
			/>
		</>
	);
};

export default SunLight;
