import { PrefixedId } from '@alef/common';
import { useLocalStorage } from './useStorage';

export function useViewingRoomId() {
	return useLocalStorage<PrefixedId<'r'> | undefined>('viewingRoomId', undefined);
}
