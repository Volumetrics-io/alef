import { Vector3 } from 'three';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export type LightDetails = {
	position: Vector3;
	// intensity: number;
	// color: number;
};

export type LightDetailsStore = {
	hoveredLightId: string | null;
	setHoveredLightId: (lightId: string | null) => void;
	selectedLightId: string | null;
	setSelectedLightId: (lightId: string | null) => void;
	lightDetails: { [key: string]: LightDetails };
	setLightPosition: (lightId: string, position: Vector3) => void;
	/** @returns the new light's id */
	addLight: (details: LightDetails) => string;
	deleteLight: (lightId: string) => void;
	globalIntensity: number;
	setGlobalIntensity: (intensity: number) => void;
	globalColor: number;
	setGlobalColor: (color: number) => void;
};

export const useLightStore = create<LightDetailsStore>()(
	subscribeWithSelector((set) => {
		return {
			hoveredLightId: null,
			setHoveredLightId: (lightId: string | null) => set({ hoveredLightId: lightId }),
			selectedLightId: null,
			setSelectedLightId: (lightId: string | null) => set({ selectedLightId: lightId, hoveredLightId: lightId }),
			lightDetails: {},
			addLight: (details) => {
				const id = crypto.randomUUID();
				set((prev) => ({
					lightDetails: {
						...prev.lightDetails,
						[id]: details,
					},
				}));
				return id;
			},
			deleteLight: (lightId: string) => {
				set((state) => {
					const { [lightId]: _, ...rest } = state.lightDetails;
					return { lightDetails: rest };
				});
			},
			setLightPosition: (lightId: string, position: Vector3) =>
				set((state) => {
					const lightDetails = state.lightDetails;
					return {
						lightDetails: {
							...lightDetails,
							[lightId]: {
								...lightDetails[lightId],
								position,
							},
						},
					};
				}),
			globalIntensity: 0.8,
			setGlobalIntensity: (intensity: number) => set({ globalIntensity: intensity }),
			globalColor: 2.7,
			setGlobalColor: (color: number) => set({ globalColor: color }),
		};
	})
);
