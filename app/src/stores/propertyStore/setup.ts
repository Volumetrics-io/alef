import { publicApiClient } from '@/services/publicApi/client';
import { connectToSocket } from '@/services/publicApi/socket';
import { handleErrors } from '@/services/publicApi/utils';
import { getDemoRoomState, PrefixedId } from '@alef/common';
import { makePropertyStore, PropertyStore, PropertyStoreState } from './propertyStore';

export function getStorageKey(propertyId: PrefixedId<'p'>) {
	return `property:${propertyId}`;
}

function createDefaultLocalProperty() {
	// TODO...
	return {
		id: 'p-local' as PrefixedId<'p'>,
		rooms: {
			'r-local': getDemoRoomState('r-local'),
		},
		propertySocket: null,
		fromApi: false,
	};
}

function hasLocalProperty() {
	return !!localStorage.getItem(getStorageKey('p-local' as PrefixedId<'p'>));
}

export async function loadProperty(propertyId: PrefixedId<'p'> | null) {
	if (!propertyId) {
		return createDefaultLocalProperty();
	}

	const data = await handleErrors(
		publicApiClient.properties[':id'].$get({
			param: { id: propertyId },
		})
	);

	if (!data) {
		// property not found.
		return createDefaultLocalProperty();
	}

	const socket = await connectToSocket(propertyId);

	return {
		id: propertyId,
		rooms: data.rooms,
		propertySocket: socket,
		fromApi: true,
	};
}

export async function migrateLocalPropertyIfNeeded(store: PropertyStore) {
	// if a local property exists, move the local room into the
	// user's new property.
	if (!hasLocalProperty()) {
		return;
	}
	// opening the local property store using the full system means
	// all migrations and other setup will also be done.
	const localPropertyStore = await makePropertyStore(null);
	const state = await new Promise<PropertyStoreState>((resolve) => {
		if (localPropertyStore.persist.hasHydrated()) {
			resolve(localPropertyStore.getState());
		}
		const unsub = localPropertyStore.persist.onFinishHydration((state) => {
			unsub();
			resolve(state);
		});
	});
	const localRoom = state.rooms['r-local'];
	// save modified rooms
	if (localRoom?.updatedAt) {
		console.info('Migrating local property room to API', {
			localRoom,
		});
		const propertyId = store.getState().meta.propertyId;
		const response = await publicApiClient.properties[':id'].rooms.$post({
			param: { id: propertyId },
			json: localRoom,
		});
		if (response.ok) {
			localPropertyStore.persist.clearStorage();
		} else {
			console.error('Failed to migrate local property', response);
		}
	}
}
