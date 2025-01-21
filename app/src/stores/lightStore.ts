import { create } from "zustand";
import { Vector3 } from "three";

export type LightDetails = {
    position: Vector3;
    // intensity: number;
    // color: number;
}

export type LightDetailsStore = {
    hoveredLightId: string | null;
    setHoveredLightId: (lightId: string | null) => void;
    selectedLightId: string | null;
    setSelectedLightId: (lightId: string | null) => void;
    lightDetails: { [key: string]: LightDetails };
    setLightDetails: (lightDetails: { [key: string]: LightDetails }) => void;
    setLightPosition: (lightId: string, position: Vector3) => void;
    globalIntensity: number;
    setGlobalIntensity: (intensity: number) => void;
    globalColor: number;
    setGlobalColor: (color: number) => void;
}

export const useLightStore = create<LightDetailsStore>((set) => {
    return {
        hoveredLightId: null,
        setHoveredLightId: (lightId: string | null) => set({ hoveredLightId: lightId }),
        selectedLightId: null,
        setSelectedLightId: (lightId: string | null) => set({ selectedLightId: lightId, hoveredLightId: lightId }),
        lightDetails: {},
        setLightDetails: (lightDetails: { [key: string]: LightDetails }) => set({ lightDetails }),
        setLightPosition: (lightId: string, position: Vector3) => set((state) => {
            const lightDetails = state.lightDetails;
            lightDetails[lightId].position = position;
            return { lightDetails };
        }),
        globalIntensity: 0.8,
        setGlobalIntensity: (intensity: number) => set({ globalIntensity: intensity }),
        globalColor: 2.7,
        setGlobalColor: (color: number) => set({ globalColor: color }),
    }
});
