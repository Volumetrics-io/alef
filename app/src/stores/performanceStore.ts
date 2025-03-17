import { FurnitureModelQuality } from '@alef/common';
import { create } from 'zustand';

export type PerformanceStore = {
	perfMode: boolean;
	setPerfMode: (mode: boolean) => void;
	maxModelQuality: FurnitureModelQuality;
	setMaxModelQuality: (quality: FurnitureModelQuality) => void;
};

export const usePerformanceStore = create<PerformanceStore>((set) => {
	return {
		perfMode: false,
		setPerfMode: (mode) => {
			console.debug(`Setting perf mode to ${mode}`);
			set({ perfMode: mode });
		},
		maxModelQuality: FurnitureModelQuality.Medium,
		setMaxModelQuality: (quality) => {
			console.debug(`Setting max model quality to ${quality}`);
			set({ maxModelQuality: quality });
		},
	};
});
