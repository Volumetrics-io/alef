import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export type EnvironmentStore = {
	sunlightIntensity: number;

	setSunlightIntensity: (intensity: number) => void;
};

export const useEnvironmentStore = create(
	subscribeWithSelector<EnvironmentStore>((set) => {
		return {
			sunlightIntensity: 1,
			setSunlightIntensity: (intensity: number) => {
				set({ sunlightIntensity: intensity });
			},
		};
	})
);

export function useSetSunlightIntensity() {
	return useEnvironmentStore((state) => state.setSunlightIntensity);
}
