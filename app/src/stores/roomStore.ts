import { id, PrefixedId } from '@alef/common';
import * as O from 'optics-ts';
import { create } from 'zustand';

export interface FurniturePlacement {
	furnitureId: PrefixedId<'f'>;
	anchorPlane: string;
}

export type RoomStoreState = {
	furniture: Record<string, FurniturePlacement>;

	addFurniture: (init: FurniturePlacement) => void;
};

export const useRoomStore = create<RoomStoreState>((set) => {
	return {
		furniture: {},
		addFurniture: (init: FurniturePlacement) => {
			const placementId = id('fp');
			set(O.modify(O.optic<RoomStoreState>().prop('furniture'))((s) => ({ ...s, [placementId]: init })));
		},
	};
});

export function useFurniturePlacementIds() {
	return useRoomStore((s) => Object.keys(s.furniture));
}

export function useFurniturePlacement(id: PrefixedId<'fp'>) {
	return useRoomStore((s) => s.furniture[id]);
}
