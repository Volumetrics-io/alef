import { PrefixedId } from './ids';

export enum FurnitureModelQuality {
	Original = 'original',
	Medium = 'medium',
	Low = 'low',
	Collision = 'collision',
}

export function getFurnitureModelPath(id: PrefixedId<'f'>, quality: FurnitureModelQuality) {
	return `${id}/${quality}.gltf`;
}

export function getFurniturePreviewImagePath(id: PrefixedId<'f'>) {
	return `${id}/preview.jpg`;
}
