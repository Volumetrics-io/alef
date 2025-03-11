import { FurnitureModelQuality } from '@alef/common';
import { create } from 'zustand';

export type PerformanceStore = {
	maxModelQuality: FurnitureModelQuality;
	setMaxModelQuality: (quality: FurnitureModelQuality) => void;
};

export const usePerformanceStore = create<PerformanceStore>((set) => {
	return {
		maxModelQuality: FurnitureModelQuality.Medium,
		setMaxModelQuality: (quality) => {
			console.debug(`Setting max model quality to ${quality}`);
			set({ maxModelQuality: quality });
		},
	};
});
