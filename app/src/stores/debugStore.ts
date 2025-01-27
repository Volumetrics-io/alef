import { Vector3 } from 'three';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export type DebugStore = {
	rawDragDelta: Vector3 | null;
	rawDragStart: Vector3 | null;
};

export const useDebugStore = create<DebugStore>()(
	subscribeWithSelector((_) => {
		return {
			rawDragDelta: null,
			rawDragStart: null,
		};
	})
);
