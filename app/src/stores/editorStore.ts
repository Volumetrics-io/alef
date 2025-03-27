import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

export type PanelState = 'open' | 'closed' | 'hidden';

export type EditorStore = {
	splashScreen: boolean;

	panelState: PanelState;
	setPanelState: (panelState: PanelState) => void;

	// only relevant for 2d mode right now
	detailsOpen: boolean;
	setDetailsOpen: (open: boolean) => void;
};

export const useEditorStore = create<EditorStore>((set, get) => {
	// enable the splash screen by default when rendering in the PWA
	const splashScreen = new URLSearchParams(window.location.search).get('directLaunch') === 'true';
	if (splashScreen) {
		// close splash screen after 5 seconds
		setTimeout(() => set({ splashScreen: false }), 5000);
	}

	return {
		splashScreen,
		panelState: 'closed',
		setPanelState: (panelState: PanelState) => set({ panelState }),
		detailsOpen: false,
		setDetailsOpen: (open) => set({ detailsOpen: open }),
	};
});

export function usePanelState() {
	return useEditorStore(useShallow((s) => [s.panelState, s.setPanelState] as const));
}

export function useSetPanelState() {
	return useEditorStore(useShallow((s) => s.setPanelState));
}

export function useDetailsOpen() {
	const value = useEditorStore((s) => s.detailsOpen);
	const set = useEditorStore((s) => s.setDetailsOpen);
	return [value, set] as const;
}
