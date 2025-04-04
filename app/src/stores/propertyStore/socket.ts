import { PropertySocket } from '@/services/publicApi/socket';
import { createDefaultEditorState } from '@alef/common';
import { WritableDraft } from 'immer';
import { PropertyStoreState } from './propertyStore';
import { createRoomApi } from './roomApi';

/**
 * Connects the Property store to the socket, live-updating based on incoming events.
 */
export function listenToSocketEvents(
	socket: PropertySocket,
	globalSet: (updater: (current: WritableDraft<PropertyStoreState>) => void) => void,
	globalGet: () => PropertyStoreState
) {
	socket.onMessage('roomUpdate', (msg) => {
		globalSet((state) => {
			const room = state.rooms[msg.data.id];
			if (!room) {
				console.info(`New room ${msg.data.id} received from socket. Inserting it.`);
				state.rooms[msg.data.id] = {
					editor: createDefaultEditorState(),
					...msg.data,
				};
				state.roomApis[msg.data.id] = createRoomApi(msg.data.id)(globalSet, globalGet);
			} else {
				Object.assign(room, msg.data);
			}
		});
	});
	socket.onMessage('roomDeleted', (msg) => {
		globalSet((state) => {
			delete state.rooms[msg.roomId];
			delete state.roomApis[msg.roomId];
			if (state.meta.selectedRoomId === msg.roomId) {
				state.meta.selectedRoomId = null;
			}
		});
	});
	socket.onMessage('syncOperations', (msg) => {
		for (const op of msg.operations) {
			const roomApi = globalGet().roomApis[op.roomId];
			if (roomApi) {
				roomApi.applyOperation(op);
			}
		}
	});

	// send backlog on connect
	socket.onConnect(async () => {
		const backlog = globalGet().meta.operationBacklog;
		if (backlog.length) {
			await socket.request({
				type: 'applyOperations',
				operations: backlog,
			});
			// clear backlog
			globalSet((state) => {
				state.meta.operationBacklog = [];
			});
		}
	});
}
