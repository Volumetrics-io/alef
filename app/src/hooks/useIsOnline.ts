import { useSearchParams } from '@verdant-web/react-router';
import { useEffect, useState } from 'react';

// uses native browser features to determine if the user is online
export function useIsOnline() {
	const [isOnline, setIsOnline] = useState(navigator.onLine);
	const [search] = useSearchParams();

	useEffect(() => {
		function updateOnlineStatus() {
			setIsOnline(navigator.onLine);
		}

		window.addEventListener('online', updateOnlineStatus);
		window.addEventListener('offline', updateOnlineStatus);

		return () => {
			window.removeEventListener('online', updateOnlineStatus);
			window.removeEventListener('offline', updateOnlineStatus);
		};
	}, []);

	if (search.get('emulateOffline') === 'true') {
		return false;
	}

	return isOnline;
}
