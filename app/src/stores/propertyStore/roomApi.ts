import {
	createOp,
	DistributiveOmit,
	EditorMode,
	getUndo,
	id,
	Operation,
	PrefixedId,
	RoomFurniturePlacement,
	RoomGlobalLighting,
	RoomLayout,
	RoomLightPlacement,
	RoomType,
	UnknownRoomPlaneData,
	updateRoom,
} from '@alef/common';
import { sentenceCase } from 'change-case';
import { ApiCreator } from './apiTypes';

export interface RoomApi {
	// Internal use only
	applyOperation: (op: Operation) => void;
	localChange: (
		opInit: DistributiveOmit<Operation, 'roomId' | 'opId'>,
		options?: { historyStack?: 'undoStack' | 'redoStack'; disableClearRedo?: boolean; localOnly?: boolean; disableHistory?: boolean; personal?: boolean }
	) => Promise<void>;

	// Editor actions
	select: (id: PrefixedId<'fp'> | PrefixedId<'lp'> | null) => void;
	setPlacingFurniture: (furnitureId: PrefixedId<'f'> | null) => void;
	setEditorMode: (mode: EditorMode) => void;

	/**
	 * Creates an empty new room layout and sets it as the current layout
	 */
	createLayout: (data?: { name?: string; type?: RoomType }) => Promise<PrefixedId<'rl'>>;
	setViewingLayoutId: (id: PrefixedId<'rl'>) => void;
	updateLayout: (data: Pick<RoomLayout, 'id' | 'name' | 'icon' | 'type'>) => void;
	updatePlanes: (planes: UnknownRoomPlaneData[]) => void;
	deleteLayout: (id: PrefixedId<'rl'>) => void;

	// furniture APIs
	addFurniture: (init: Omit<RoomFurniturePlacement, 'id'>) => Promise<PrefixedId<'fp'>>;
	updateFurnitureId: (id: PrefixedId<'fp'>, furnitureId: PrefixedId<'f'>) => Promise<void>;
	moveFurniture: (
		id: PrefixedId<'fp'>,
		transform: {
			position?: { x: number; y: number; z: number };
			rotation?: { x: number; y: number; z: number; w: number };
		}
	) => Promise<void>;
	deleteFurniture: (id: PrefixedId<'fp'>) => Promise<void>;

	// light APIs
	addLight: (init: Omit<RoomLightPlacement, 'id'>) => Promise<PrefixedId<'lp'>>;
	moveLight: (
		id: PrefixedId<'lp'>,
		transform: {
			position?: { x: number; y: number; z: number };
		}
	) => Promise<void>;
	deleteLight: (id: PrefixedId<'lp'>) => Promise<void>;
	updateGlobalLighting: (update: Partial<RoomGlobalLighting>, options?: { localOnly?: boolean }) => Promise<void>;
}

export const createRoomApi: (roomId: PrefixedId<'r'>) => ApiCreator<RoomApi> = (roomId) => (globalSet, globalGet) => {
	function getRoom() {
		return globalGet().rooms[roomId];
	}

	function getLayoutId() {
		const id = getRoom().editor.selectedLayoutId;
		if (!id) {
			throw new Error('No layout selected');
		}
		return id;
	}

	// to avoid double-applying operations, we keep track of seen ops.
	const seenOps = new Set<string>();
	function applyOperation(op: Operation) {
		if (op.roomId !== roomId) {
			console.error('Received operation for wrong room:', op, 'received by', roomId);
			return;
		}
		if (seenOps.has(op.opId)) {
			// already seen this op, ignore it.
			return;
		}
		seenOps.add(op.opId);
		globalSet((state) => {
			const roomState = state.rooms[roomId];
			if (!roomState) {
				console.warn('Room is missing in state', roomId);
				return;
			}
			updateRoom(roomState, op);
		});
	}

	async function localChange(
		opInit: DistributiveOmit<Operation, 'roomId' | 'opId'>,
		{
			historyStack = 'undoStack',
			disableClearRedo,
			localOnly,
			disableHistory = localOnly,
			personal,
		}: { historyStack?: 'undoStack' | 'redoStack'; disableClearRedo?: boolean; localOnly?: boolean; disableHistory?: boolean; personal?: boolean } = {}
	): Promise<void> {
		// fill in missing operation metadata
		const op = createOp({ roomId, ...opInit });

		// generate an undo operation before applying using the current state
		const undo = getUndo(getRoom(), op);

		// try applying the operation to the local state
		try {
			applyOperation(op);
		} catch (err) {
			console.error('Failed to apply operation:', op, err);
			// do nothing, ignore this change.
			return;
		}

		// if undo is enabled, push the undo operation to the history stack
		if (undo && !disableHistory) {
			globalSet((state) => {
				state.history[historyStack].push(undo);
			});
		}

		// send to server

		const socket = globalGet().propertySocket;

		// client-only -- don't bother keeping a backlog.
		if (!socket || localOnly) return;

		if (socket?.isClosed) {
			globalSet((state) => {
				if (!personal) {
					state.meta.operationBacklog.push(op);
				}
				if (!disableClearRedo) {
					state.history.redoStack = [];
				}
			});
		} else {
			try {
				await socket.request({
					type: 'applyOperations',
					operations: [op],
					personal,
				});
				if (!disableClearRedo) {
					globalSet((state) => {
						state.history.redoStack = [];
					});
				}
			} catch (e) {
				if (e instanceof Error && e.message === 'Request timed out') {
					globalSet((state) => {
						if (!personal) {
							state.meta.operationBacklog.push(op);
						}
						if (!disableClearRedo) {
							state.history.redoStack = [];
						}
					});
				}
			}
		}
	}

	return {
		localChange,
		applyOperation,
		select: (id) =>
			localChange(
				{
					type: 'selectObject',
					objectId: id,
				},
				{
					personal: true,
				}
			),
		setPlacingFurniture: (furnitureId) => {
			return localChange(
				{
					type: 'setPlacingFurniture',
					furnitureId,
				},
				{
					personal: true,
				}
			);
		},
		setEditorMode: (mode) => {
			return localChange(
				{
					type: 'setEditorMode',
					mode,
				},
				{
					personal: true,
				}
			);
		},

		updatePlanes: async (planes) => {
			console.debug('Updating XR planes. There are:', planes.length, 'planes detected');
			await localChange({
				type: 'updatePlanes',
				planes,
				time: Date.now(),
			});
		},

		createLayout: async (data) => {
			let name = data?.name;
			const type: RoomType = data?.type || 'living-room';
			if (!name) {
				// name it after the room type, incrementing as needed
				const nameFromType = sentenceCase(type);
				const othersWithName = Object.values(getRoom().layouts).filter((layout) => layout?.name?.startsWith(nameFromType)).length;
				name = `${nameFromType}${othersWithName > 0 ? ' ' + (othersWithName + 1) : ''}`;
			}
			const layoutId = id('rl');
			await localChange({
				type: 'createLayout',
				data: { id: layoutId, name, type },
			});
			await localChange({
				type: 'selectLayout',
				layoutId,
			});

			return layoutId;
		},
		async setViewingLayoutId(id) {
			await localChange({
				type: 'selectLayout',
				layoutId: id,
			});
		},
		updateLayout: async (data) => {
			await localChange({
				type: 'updateLayout',
				data,
			});
		},

		deleteLayout: async (id) => {
			await localChange({
				type: 'deleteLayout',
				layoutId: id,
			});
			if (getRoom().editor.selectedLayoutId === id) {
				const newLayoutId = Object.keys(getRoom().layouts)[0] as PrefixedId<'rl'> | null;
				if (newLayoutId) {
					await localChange({ type: 'selectLayout', layoutId: newLayoutId });
				}
			}
		},

		addFurniture: async (init) => {
			const placementId = id('fp');
			const layoutId = getLayoutId();
			const placement = {
				id: placementId,
				...init,
			};

			await localChange({
				type: 'addFurniture',
				roomLayoutId: layoutId,
				data: placement,
			});

			return placementId;
		},
		moveFurniture: async (id, { position, rotation }) => {
			await localChange({
				type: 'updateFurniture',
				layoutId: getLayoutId(),
				data: {
					id,
					// transform to pojos
					position: position && { x: position.x, y: position.y, z: position.z },
					rotation: rotation && { x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w },
				},
			});
		},
		updateFurnitureId: async (id, furnitureId) => {
			await localChange({
				type: 'updateFurniture',
				layoutId: getLayoutId(),
				data: {
					id,
					furnitureId,
				},
			});
		},
		deleteFurniture: async (id) => {
			await localChange({
				type: 'removeFurniture',
				layoutId: getLayoutId(),
				id,
			});
		},

		addLight: async (init) => {
			const placementId = id('lp');
			const placement = {
				id: placementId,
				...init,
			};
			await localChange({
				type: 'addLight',
				data: placement,
			});
			return placementId;
		},
		moveLight: async (id, { position }) => {
			await localChange({
				type: 'updateLight',
				data: {
					id,
					position,
				},
			});
		},
		deleteLight: async (id) => {
			await localChange({
				type: 'removeLight',
				id,
			});
		},
		updateGlobalLighting: async (update, options) => {
			await localChange(
				{
					type: 'updateGlobalLighting',
					data: update,
				},
				options
			);
		},
	};
};
