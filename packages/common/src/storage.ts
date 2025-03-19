import { PrefixedId } from './ids.js';

export enum FurnitureModelQuality {
	Original = 'original',
	Medium = 'medium',
	Low = 'low',
	Collision = 'collision',
}

export const RANKED_FURNITURE_MODEL_QUALITIES = [FurnitureModelQuality.Original, FurnitureModelQuality.Medium, FurnitureModelQuality.Low];

export function getFurnitureModelPath(id: PrefixedId<'f'>, quality: FurnitureModelQuality) {
	return `${id}/${quality}.gltf`;
}

export function getFurniturePreviewImagePath(id: PrefixedId<'f'>) {
	return `${id}/preview.jpg`;
}
