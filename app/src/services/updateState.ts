import { useCallback, useState } from 'react';
import { proxy, useSnapshot } from 'valtio';
import { registerSW } from 'virtual:pwa-register';

export const updateState = proxy({
	updateAvailable: false,
});

let check: (() => void) | undefined = undefined;

const update = registerSW({
	onNeedRefresh() {
		updateState.updateAvailable = true;
		console.log('Update available and ready to install');
	},
	onRegisteredSW(swUrl, registration) {
		console.log('Service worker registered', swUrl);
		if (registration) {
			setInterval(
				() => {
					registration.update();
					check = registration.update;
					// hourly
				},
				60 * 60 * 1000
			);
		}
	},
	onRegisterError(error) {
		console.error('Service worker registration error', error);
	},
});

export async function updateApp(reload?: boolean) {
	await update(!!reload);
}

export function checkForUpdate() {
	check?.();
}

export function useUpdateApp() {
	const updateAvailable = useSnapshot(updateState).updateAvailable;
	const [loading, setLoading] = useState(false);

	const update = useCallback(async (reload = true) => {
		setLoading(true);
		try {
			await updateApp(reload);
		} finally {
			setLoading(false);
		}
	}, []);

	return { update, updateAvailable, updating: loading };
}
