import { PlaneLabel } from '@/components/xr/anchors';
import { id, PrefixedId } from '@alef/common';
import { ThreeEvent } from '@pmndrs/uikit';
import * as O from 'optics-ts';
import { useCallback, useRef } from 'react';
import { Group, Object3D, Vector3 } from 'three';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

export interface FurniturePlacement {
	furnitureId: PrefixedId<'f'>;
	worldPosition: Vector3;
	// these are metadata useful for potential future heuristics,
	// like correcting world position to re-align with the anchor
	// used for the original placement.
	anchorLabel?: PlaneLabel;
	anchorOffset?: number;
}

export type RoomStoreState = {
	furniture: Record<string, FurniturePlacement>;

	addFurniture: (init: FurniturePlacement) => void;
	moveFurniture: (id: PrefixedId<'fp'>, position: Vector3) => void;
};

export const useRoomStore = create<RoomStoreState>()(
	// temporary - persist store to localStorage
	persist(
		subscribeWithSelector((set) => {
			return {
				furniture: {},
				addFurniture: (init: FurniturePlacement) => {
					const placementId = id('fp');
					set(O.modify(O.optic<RoomStoreState>().prop('furniture'))((s) => ({ ...s, [placementId]: init })));
				},
				moveFurniture: (id, position) => {
					set(O.modify(O.optic<RoomStoreState>().prop('furniture').prop(id).prop('worldPosition'))(() => position));
				},
			};
		}),
		{
			name: 'testing-roomstore',
			partialize: (state) => ({
				furniture: state.furniture,
			}),
		}
	)
);

export function useFurniturePlacementIds() {
	return useRoomStore(useShallow((s) => Object.keys(s.furniture) as PrefixedId<'fp'>[]));
}

export function useFurniturePlacement(id: PrefixedId<'fp'>) {
	return useRoomStore((s) => s.furniture[id]);
}

export function useFurniturePlacementFurnitureId(id: PrefixedId<'fp'>) {
	return useRoomStore((s) => s.furniture[id]?.furnitureId);
}

export function useAddFurniture() {
	return useRoomStore((s) => s.addFurniture);
}

export function useSubscribeToPlacementPosition(id: PrefixedId<'fp'>, callback: (position: Vector3) => void) {
	return useRoomStore.subscribe(
		(s) => s.furniture[id],
		(placement) => {
			if (placement) {
				callback(placement.worldPosition);
			}
		},
		{
			fireImmediately: true,
		}
	);
}

export function useFurniturePlacementPosition(id: PrefixedId<'fp'>) {
	const groupRef = useRef<Group>(null);
	const initialPositionRef = useRef<Vector3>(new Vector3());
	const isDraggingRef = useRef(false);
	const moveFurniture = useRoomStore((s) => s.moveFurniture);

	useSubscribeToPlacementPosition(id, (position) => {
		// avoid clobbering in-progress drag
		if (isDraggingRef.current) {
			return;
		}

		groupRef.current?.position.copy(position);
	});

	const beginDrag = useCallback((ev: ThreeEvent) => {
		if (!groupRef.current) {
			return;
		}

		isDraggingRef.current = true;
		initialPositionRef.current.copy(groupRef.current.position);
		// IDK why TS doesn't see Group as a subclass of Object3D.
		(groupRef.current as unknown as Object3D).setPointerCapture(ev.pointerId);
	}, []);

	const commitDrag = useCallback(() => {
		if (!isDraggingRef.current || !groupRef.current) {
			return;
		}
		isDraggingRef.current = false;
		initialPositionRef.current.set(0, 0, 0);
		moveFurniture(id, groupRef.current.position);
	}, [id, moveFurniture]);

	const onDrag = useCallback((ev: ThreeEvent) => {
		if (!groupRef.current || !isDraggingRef.current) {
			return;
		}

		groupRef.current.position.copy(ev.point);
	}, []);

	const cancelDrag = useCallback(() => {
		isDraggingRef.current = false;
		groupRef.current?.position.copy(initialPositionRef.current);
	}, []);

	return { beginDrag, commitDrag, onDrag, groupRef, cancelDrag };
}
