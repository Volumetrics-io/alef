import { useIsOnline } from '@/hooks/useIsOnline';
import { OfflineFurniturePanel } from './OfflineFurniturePanel';
import { OnlineFurniturePanel } from './OnlineFurniturePanel';

export function FurniturePanel() {
	const isOnline = useIsOnline();

	if (!isOnline) {
		return <OfflineFurniturePanel />;
	}

	return <OnlineFurniturePanel />;
}
