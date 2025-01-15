import { PlaneLabel } from '@/components/xr/anchors';
import { id, PrefixedId } from '@alef/common';
import * as O from 'optics-ts';
import { Vector3 } from 'three';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
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
};

export const useRoomStore = create<RoomStoreState>()(
	subscribeWithSelector((set) => {
		return {
			furniture: {},
			addFurniture: (init: FurniturePlacement) => {
				const placementId = id('fp');
				set(O.modify(O.optic<RoomStoreState>().prop('furniture'))((s) => ({ ...s, [placementId]: init })));
			},
		};
	})
);

export function useFurniturePlacementIds() {
	return useRoomStore(useShallow((s) => Object.keys(s.furniture) as PrefixedId<'fp'>[]));
}

export function useFurniturePlacement(id: PrefixedId<'fp'>) {
	return useRoomStore((s) => s.furniture[id]);
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
		}
	);
}
