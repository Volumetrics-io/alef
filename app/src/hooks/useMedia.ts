import { useSyncExternalStore } from 'react';

export function useMedia(query: string) {
	const media = window.matchMedia(query);
	return useSyncExternalStore(
		(listener) => {
			media.addEventListener('change', listener);
			return () => media.removeEventListener('change', listener);
		},
		() => media.matches
	);
}
