import { publicApiClient } from '@/services/publicApi/client';
import { createDefaultEditorState, getEmptyRoomState, PrefixedId, RoomState, RoomStateInit } from '@alef/common';
import toast from 'react-hot-toast';
import { ApiCreator } from './apiTypes';
import { createRoomApi } from './roomApi';

export interface PropertyApi {
	selectRoom: (roomId: PrefixedId<'r'> | null) => void;
	/** Creates and selects a new room */
	createRoom: (init?: RoomStateInit) => void;
}

export const createPropertyApi: ApiCreator<PropertyApi> = (globalSet, globalGet) => {
	return {
		selectRoom: (roomId) => {
			globalSet((state) => {
				state.meta.selectedRoomId = roomId;
			});
		},
		createRoom: async (init) => {
			const propertyId = globalGet().meta.propertyId;

			const response = await publicApiClient.properties[':id'].rooms.$post({
				param: { id: propertyId },
				json: init || getEmptyRoomState(),
			});

			if (!response.ok) {
				toast.error('Failed to create room');
				return;
			}

			const room = await response.json();
			globalSet((state) => {
				state.rooms[room.id] = {
					editor: createDefaultEditorState(),
					...(room as RoomState),
				};
				state.roomApis[room.id] = createRoomApi(room.id)(globalSet, globalGet);
			});
		},
	};
};
