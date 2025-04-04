import { createDefaultEditorState, migrateRoomState, PrefixedId, RoomStateWithEditor } from '@alef/common';
import { PersistedPropertyStoreState } from './propertyStore';

export const PROPERTY_STORE_VERSION = 1;

export function migratePropertyStore(persistedState: any, persistedVersion: number): PersistedPropertyStoreState {
	console.debug(`Migrating property store from version ${persistedVersion} to ${PROPERTY_STORE_VERSION}`);
	if (persistedVersion === PROPERTY_STORE_VERSION) {
		return persistedState;
	}

	if (persistedVersion === 0) {
		const { meta, rooms } = persistedState;
		return {
			meta,
			/** Migrate room state to version 1 */
			rooms: Object.entries(rooms).reduce(
				(acc, [roomId, room]) => {
					acc[roomId as PrefixedId<'r'>] = {
						editor: createDefaultEditorState(),
						...migrateRoomState(room),
					};
					return acc;
				},
				{} as Record<string, RoomStateWithEditor>
			),
		};
	}

	throw new Error(`Unsupported migration from version ${persistedVersion} to ${PROPERTY_STORE_VERSION}`);
}
