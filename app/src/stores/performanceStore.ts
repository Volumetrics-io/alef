import { FurnitureModelQuality } from '@alef/common';
import { create } from 'zustand';

export type PerformanceStore = {
	framebufferScale: number;
	setFramebufferScale: (scale: number) => void;
	maxModelQuality: FurnitureModelQuality;
	setMaxModelQuality: (quality: FurnitureModelQuality) => void;
};

export const usePerformanceStore = create<PerformanceStore>((set) => {
	return {
		framebufferScale: 1.0,
		setFramebufferScale: (scale) => {
			console.debug(`Setting framebuffer scale to ${scale}`);
			set({ framebufferScale: scale });
		},
		maxModelQuality: FurnitureModelQuality.Medium,
		setMaxModelQuality: (quality) => {
			console.debug(`Setting max model quality to ${quality}`);
			set({ maxModelQuality: quality });
		},
	};
});
