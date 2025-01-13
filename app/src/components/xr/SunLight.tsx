import React, { useEffect, useState } from 'react';
import SunCalc from 'suncalc';

const SunLight: React.FC = () => {
  const [lightData, setLightData] = useState<{
    position: [number, number, number];
    color: string;
    intensity: number;
  }>({
    position: [0, 0, 0],
    color: '#ffffff',
    intensity: 1,
  });

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

    // Optionally, update the sun position, color, and intensity at regular intervals
    const interval = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            updateSunData(latitude, longitude);
          },
          (error) => {
            console.error('Error fetching geolocation:', error);
          }
        );
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <directionalLight
        position={lightData.position}
        color={lightData.color}
        intensity={lightData.intensity}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={500}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      <ambientLight intensity={0.3} color={lightData.color} />
    </>
  );
};

export default SunLight;
