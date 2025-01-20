import { create } from "zustand";
import { Vector3 } from "three";

export type StageMode = 'lighting' | 'furniture' | null

export type StageStore = {
    mode: StageMode;
    setMode: (mode: StageMode) => void;
}

export const useStageStore = create<StageStore>((set) => {
    return {
        mode: 'lighting',
        setMode: (mode: StageMode) => set({ mode }),
    }
});