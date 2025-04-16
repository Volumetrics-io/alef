import { ComponentType, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RootScene } from './RootScene';

export function mountApp(App: ComponentType) {
	const rootEl = document.createElement('div');
	rootEl.id = 'root';
	rootEl.style.setProperty('width', '100%');
	rootEl.style.setProperty('height', '100%');
	document.body.appendChild(rootEl);

	const root = createRoot(rootEl);
	root.render(
		<StrictMode>
			<RootScene>
				<App />
			</RootScene>
		</StrictMode>
	);
}
