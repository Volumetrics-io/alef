import { RoomType } from './attributes';
import { PrefixedId } from './ids';

export interface SimpleVector3 {
	x: number;
	y: number;
	z: number;
}
export interface SimpleQuaternion {
	x: number;
	y: number;
	z: number;
	w: number;
}

export interface RoomState {
	id: PrefixedId<'r'>;
	walls: RoomWallData[];
	layouts: Record<PrefixedId<'rl'>, RoomLayout>;
	globalLighting: RoomGlobalLighting;
}

export interface RoomLayout {
	id: PrefixedId<'rl'>;
	furniture: Record<PrefixedId<'fp'>, RoomFurniturePlacement>;
	lights: Record<PrefixedId<'lp'>, RoomLightPlacement>;
	/** An icon override. Kind of legacy. */
	icon?: string;
	name?: string;
	/** A specified type for this room layout, if specified */
	type?: RoomType;
}

export interface RoomWallData {
	origin: SimpleVector3;
	normal: SimpleVector3;
	extents: [number, number];
}

export interface RoomFurniturePlacement {
	id: PrefixedId<'fp'>;
	position: SimpleVector3;
	rotation: SimpleQuaternion;
	furnitureId: PrefixedId<'f'>;
}

export interface RoomLightPlacement {
	id: PrefixedId<'lp'>;
	position: SimpleVector3;
}

export interface RoomGlobalLighting {
	color: number;
	intensity: number;
}

export type Updates<T extends { id: any }> = T extends { id: infer U } ? { id: U } & Partial<Omit<T, 'id'>> : T;
