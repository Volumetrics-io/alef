import React, { useEffect, useState, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import SunCalc from 'suncalc';
import { useEnvironmentContext } from './Environment';
import { Object3D, Vector3 } from 'three';

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

const SunLight: React.FC = () => {
  const { scene } = useThree();
  const environment = useEnvironmentContext();
  const lightTarget = useRef<Object3D>(new Object3D());

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

  // Update sun position, color, and intensity based on geolocation and time
  useEffect(() => {
    const updateSunData = (latitude: number, longitude: number): LightData => {
      const now = new Date();
      const sunPosition = SunCalc.getPosition(now, latitude, longitude);

      const altitude = sunPosition.altitude; // radians
      const azimuth = sunPosition.azimuth; // radians

      // Convert spherical coordinates to Cartesian coordinates
      const radius = 100; // Distance from the origin
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

    const fetchGeolocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const sunData = updateSunData(latitude, longitude);
            setLightData(sunData);
          },
          (error) => {
            console.error('Error fetching geolocation:', error);
            // Default to a preset location if geolocation fails
            const sunData = updateSunData(0, 0);
            setLightData(sunData);
          }
        );
      } else {
        console.error('Geolocation is not supported by this browser.');
        // Default to a preset location if geolocation is unavailable
        const sunData = updateSunData(0, 0);
        setLightData(sunData);
      }
    };

    fetchGeolocation();

    // Update sun data at regular intervals
    const interval = setInterval(() => {
      fetchGeolocation();
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Adjust light based on window positions from EnvironmentContext
  useEffect(() => {
    if (!environment) return;

    const windows = environment['window'] || [];

    if (windows.length === 0) return;

    const meshWorldPosition = new Vector3();
    // Calculate average position of all window meshes
    const averagePosition = windows.reduce(
      (acc, mesh) => {
        mesh.getWorldPosition(meshWorldPosition);
        acc[0] += meshWorldPosition.x;
        acc[1] += meshWorldPosition.y;
        acc[2] += meshWorldPosition.z;
        return acc;
      },
      [0, 0, 0]
    );

    const count = windows.length;
    const avgPos: [number, number, number] = [
      averagePosition[0] / count,
      averagePosition[1] / count,
      averagePosition[2] / count,
    ];

    // Update the light target to the average window position
    lightTarget.current.position.set(avgPos[0], avgPos[1], avgPos[2]);
    scene.add(lightTarget.current);

    // Prioritize window positions by adjusting light data
    setLightData((prev) => ({
      directional: {
        ...prev.directional,
        position: [
          avgPos[0] + prev.directional.position[0] * 0.5,
          avgPos[1] + prev.directional.position[1] * 0.3,
          avgPos[2] + prev.directional.position[2] * 0.5,
        ],
        intensity: Math.min(0.75,  count * 0.5),
      },
      ambient: {
        ...prev.ambient,
        intensity: Math.min(1, count * 0.2),
      },
    }));
  }, [
    environment,
    lightData.directional.position,
    lightData.directional.intensity,
    lightData.ambient.intensity,
    scene,
  ]);

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
        // shadow-camera-left={-50}
        // shadow-camera-right={50}
        // shadow-camera-top={50}
        // shadow-camera-bottom={-50}
        shadow-bias={0.000008}
      />
      <ambientLight
        intensity={lightData.ambient.intensity}
        color={lightData.ambient.color}
      />
    </>
  );
};

export default SunLight;
