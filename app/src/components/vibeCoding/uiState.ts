import { proxy, subscribe } from 'valtio';

export const uiState = proxy({
	mainPanelClosed: false,
	sidebarSize: 500,
});

// load size from local storage on launch
const stored = localStorage.getItem('ui-state');
if (stored) {
	const parsed = JSON.parse(stored);
	uiState.sidebarSize = parsed.sidebarSize ?? uiState.sidebarSize;
	uiState.mainPanelClosed = parsed.mainPanelClosed ?? uiState.mainPanelClosed;
}
// save size to local storage on change
subscribe(uiState, () => {
	localStorage.setItem('ui-state', JSON.stringify(uiState));
});
