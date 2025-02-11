/* eslint-disable react-refresh/only-export-components */

import { usePropertySocket } from '@/services/publicApi/PropertySocketProvider';
import { PrefixedId } from '@alef/common';
import { createContext, ReactNode, useContext, useMemo } from 'react';
import { makeRoomStore, RoomStore } from './roomStore';

const RoomStoreContext = createContext<RoomStore | null>(null);

export const RoomStoreProvider = ({ children, roomId }: { children: ReactNode; roomId: PrefixedId<'r'> }) => {
	const socket = usePropertySocket();
	const store = useMemo(() => makeRoomStore(socket, roomId), [socket, roomId]);
	(window as any).roomStore = store;
	return <RoomStoreContext.Provider value={store}>{children}</RoomStoreContext.Provider>;
};

export function useRoomStoreContext() {
	const store = useContext(RoomStoreContext);
	if (!store) {
		throw new Error('useRoomStoreContext must be used within a RoomStoreProvider');
	}
	return store;
}
