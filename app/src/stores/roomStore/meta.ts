import { assertPrefixedId, id, isPrefixedId, PrefixedId } from '@alef/common';
import { useSearchParams } from '@verdant-web/react-router';
import { useCallback, useEffect, useState, useTransition } from 'react';

export const getRoomStoreStorageKey = (roomLayoutId: PrefixedId<'rl'>) => {
	return `roomStore-${roomLayoutId}`;
};

export function useActiveRoomLayoutId() {
	const [search] = useSearchParams();
	let roomLayoutId = search.get('roomLayoutId');
	const generatedDefaultId = id('rl');
	const allLayoutIds = useRoomLayouts();
	let updateQuery = false;
	if (!roomLayoutId) {
		updateQuery = true;
		roomLayoutId = allLayoutIds[0] || generatedDefaultId;
	}
	assertPrefixedId(roomLayoutId, 'rl');
	const setRoomLayoutId = useSetRoomLayoutId();
	useEffect(() => {
		if (updateQuery) {
			setRoomLayoutId(roomLayoutId);
		}
	}, [roomLayoutId, setRoomLayoutId, updateQuery]);
	return roomLayoutId;
}

export function useCreateRoomLayout() {
	const set = useSetRoomLayoutId();
	return useCallback(() => {
		const layoutId = id('rl');
		localStorage.setItem(getRoomStoreStorageKey(layoutId), JSON.stringify({}));
		roomLayoutsEvents.dispatchEvent(new Event('change'));
		set(layoutId);
	}, [set]);
}

export function useSetRoomLayoutId() {
	const [, setSearch] = useSearchParams();
	const [, startTransition] = useTransition();
	const setRoomLayoutId = useCallback(
		(id: string) => {
			assertPrefixedId(id, 'rl');
			startTransition(() => {
				setSearch((p) => {
					p.set('roomLayoutId', id);
					return p;
				});
			});
		},
		[setSearch]
	);
	return setRoomLayoutId;
}

const roomLayoutsEvents = new EventTarget();

/**
 * TODO: move this to the backend
 */
export function useRoomLayouts() {
	const loadIds = useCallback((): PrefixedId<'rl'>[] => {
		const localStorageKeys = Object.keys(localStorage);
		const roomLayoutKeys = localStorageKeys.filter((key) => key.startsWith('roomStore-'));
		const ids = roomLayoutKeys.map((key) => key.replace('roomStore-', ''));
		return ids.filter((v) => isPrefixedId(v, 'rl'));
	}, []);
	const [ids, setIds] = useState<PrefixedId<'rl'>[]>(loadIds);
	useEffect(() => {
		const listener = () => {
			setIds(loadIds());
		};
		roomLayoutsEvents.addEventListener('change', listener);
		return () => {
			roomLayoutsEvents.removeEventListener('change', listener);
		};
	}, [loadIds]);
	return ids;
}
