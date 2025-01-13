import React, { useEffect, useState, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import SunCalc from 'suncalc';
import { useEnvironmentContext } from './Environment';
import { Object3D } from 'three';

const SunLight: React.FC = () => {
  const { scene } = useThree();
  const environment = useEnvironmentContext();
  const lightTarget = useRef<Object3D>(new Object3D());

  const [lightData, setLightData] = useState<{
    position: [number, number, number];
    color: string;
    intensity: number;
  }>({
    position: [0, 100, 0], // Initial position above the scene
    color: '#ffffff',
    intensity: 10,
  });

  // Update sun position, color, and intensity based on geolocation and time
  useEffect(() => {
    const updateSunData = (latitude: number, longitude: number) => {
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
      const intensity = Math.max(0.2, normalizedAltitude); // Ensure a minimum intensity

      // Calculate light color based on altitude
      let color = '#ffffff'; // Default color
      if (normalizedAltitude < 0.3) {
        // Sunrise or sunset colors
        color = '#FF7E67'; // Warm orange
      } else if (normalizedAltitude < 0.6) {
        // Morning or evening
        color = '#FFD27F'; // Soft yellow
      } else {
        // Midday
        color = '#ffffff'; // Bright white
      }

      setLightData({
        position: [x, y, z],
        color,
        intensity,
      });
    };

    const fetchGeolocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            updateSunData(latitude, longitude);
          },
          (error) => {
            console.error('Error fetching geolocation:', error);
            // Default to a preset location if geolocation fails
            updateSunData(0, 0);
          }
        );
      } else {
        console.error('Geolocation is not supported by this browser.');
        // Default to a preset location if geolocation is unavailable
        updateSunData(0, 0);
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

    // Calculate average position of all window meshes
    const averagePosition = windows.reduce(
      (acc, mesh) => {
        acc[0] += mesh.position.x;
        acc[1] += mesh.position.y;
        acc[2] += mesh.position.z;
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

    // Adjust intensity based on number of windows
    const adjustedIntensity = Math.min(2, lightData.intensity + count * 0.1);

    setLightData((prev) => ({
      ...prev,
      intensity: adjustedIntensity,
    }));
  }, [environment, lightData.intensity, scene]);

  return (
    <>
      <directionalLight
        position={lightData.position}
        color={lightData.color}
        intensity={lightData.intensity}
        castShadow
        target={lightTarget.current}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={500}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      <ambientLight intensity={0.3} color="#ffffff" />
    </>
  );
};

export default SunLight;
