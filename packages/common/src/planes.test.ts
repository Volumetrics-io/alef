import { describe, expect, it } from 'vitest';
import { mergePlanes } from './planes.js';
import { RoomPlaneData, UnknownRoomPlaneData } from './rooms/state.js';

describe('plane merging', () => {
	it('merges similar planes to existing ones, adds unique ones, and removes unmatched ones', () => {
		const existingPlanes: RoomPlaneData[] = [
			{
				id: 'rp-1',
				extents: [10, 10],
				label: 'floor',
				orientation: { x: 0, y: 1, z: 0, w: 1 },
				origin: { x: 0, y: 0, z: 0 },
			},
			{
				id: 'rp-2',
				extents: [10, 3],
				label: 'wall',
				orientation: { x: 1, y: 0, z: 0, w: 1 },
				origin: { x: -5, y: 0, z: 0 },
			},
			{
				id: 'rp-3',
				extents: [10, 3],
				label: 'wall',
				orientation: { x: -1, y: 0, z: 0, w: 1 },
				origin: { x: 5, y: 0, z: 0 },
			},
			{
				id: 'rp-4',
				extents: [10, 10],
				label: 'ceiling',
				orientation: { x: 0, y: -1, z: 0, w: 1 },
				origin: { x: 0, y: 10, z: 0 },
			},
		];
		const newPlanes: UnknownRoomPlaneData[] = [
			{
				extents: [9.999, 10],
				label: 'floor',
				orientation: { x: 0, y: 1, z: -0.0009998, w: 1 },
				origin: { x: 0, y: 0.000001, z: 0 },
			},
			{
				extents: [10, 3],
				label: 'wall',
				orientation: { x: 1, y: 0, z: 0.1, w: 1 },
				origin: { x: -5.0001, y: 0.02, z: 0 },
			},
			{
				extents: [11, 3.5],
				label: 'wall',
				orientation: { x: -1, y: 0, z: 0, w: 1 },
				origin: { x: 5, y: 0, z: 0 },
			},
		];
		const merged = mergePlanes(existingPlanes, newPlanes);
		expect(merged).toHaveLength(3);
		const plane1 = merged.find((p) => p.id === 'rp-1');
		expect(plane1).toEqual({
			...newPlanes[0],
			id: 'rp-1',
		});
		const plane2 = merged.find((p) => p.id === 'rp-2');
		expect(plane2).toEqual({
			...newPlanes[1],
			id: 'rp-2',
		});
		// the third plane is replaced since it was not a close enough match. the id will be unknown.
		const replaced = merged.find((p) => !['rp-1', 'rp-2'].includes(p.id));
		expect(replaced).toMatchObject(newPlanes[2]);
	});
});
