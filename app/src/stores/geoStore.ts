import { create } from 'zustand';

interface GeoPosition {
  latitude: number;
  longitude: number;
}

interface GeoStore {
  position: GeoPosition;
  isLoading: boolean;
  error: string | null;
  fetchLocation: () => Promise<void>;
}

// Function to fetch geolocation data once at startup
const fetchIPLocation = async (): Promise<{ latitude: number; longitude: number }> => {
  try {
    const response = await fetch('http://ip-api.com/json/');
    const data = await response.json();
    return {
      latitude: data.lat,
      longitude: data.lon
    };
  } catch (error) {
    console.error('Error fetching IP location:', error);
    return { latitude: 0, longitude: 0 };
  }
};

export const useGeoStore = create<GeoStore>((set) => ({
  position: { latitude: 0, longitude: 0 },
  isLoading: false,
  error: null,
  fetchLocation: async () => {
    set({ isLoading: true, error: null });
    try {
      const position = await fetchIPLocation();
      set({ position, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch location',
        isLoading: false 
      });
    }
  },
}));