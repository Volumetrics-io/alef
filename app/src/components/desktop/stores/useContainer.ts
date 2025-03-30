import { create } from 'zustand';

interface ContainerStore {
	container: HTMLDivElement | null;
	setContainer: (container: HTMLDivElement | null) => void;
}

export const useContainerStore = create<ContainerStore>((set) => ({
	container: null,
	setContainer: (container) => set({ container }),
}));
