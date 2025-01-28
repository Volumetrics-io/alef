import { create } from 'zustand';

export type StageMode = 'lighting' | 'furniture' | 'layout' | null;

export type StageStore = {
	mode: StageMode;
	setMode: (mode: StageMode) => void;
};

export const useStageStore = create<StageStore>((set) => {
	return {
		mode: null,
		setMode: (mode: StageMode) => set({ mode }),
	};
});
