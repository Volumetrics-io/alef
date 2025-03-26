import { create } from 'zustand';

export type QualityLevel = 'low' | 'high';

export type PerformanceStore = {
	qualityLevel: QualityLevel;
	setQualityLevel: (level: QualityLevel) => void;
};

export const usePerformanceStore = create<PerformanceStore>((set) => {
	// run in high-performance/low-quality mode if directLaunch is enabled, which
	// is set by the PWA/TWA app
	const perfMode = new URLSearchParams(window.location.search).get('directLaunch') === 'true';
	return {
		qualityLevel: perfMode ? 'low' : 'high',
		setQualityLevel: (level) => {
			console.debug(`Setting rendering quality level to ${level}`);
			set({ qualityLevel: level });
		},
	};
});
