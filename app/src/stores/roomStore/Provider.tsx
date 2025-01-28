/* eslint-disable react-refresh/only-export-components */

import { createContext, ReactNode, useContext, useMemo } from 'react';
import { useActiveRoomLayoutId } from './meta';
import { makeRoomStore, RoomStore } from './roomStore';

const RoomStoreContext = createContext<RoomStore | null>(null);

export const RoomStoreProvider = ({ children }: { children: ReactNode }) => {
	const roomLayoutId = useActiveRoomLayoutId();
	const store = useMemo(() => makeRoomStore(roomLayoutId), [roomLayoutId]);
	return <RoomStoreContext.Provider value={store}>{children}</RoomStoreContext.Provider>;
};

export function useRoomStoreContext() {
	const store = useContext(RoomStoreContext);
	if (!store) {
		throw new Error('useRoomStoreContext must be used within a RoomStoreProvider');
	}
	return store;
}
