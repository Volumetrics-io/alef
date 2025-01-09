import { PrefixedId } from './ids';

/**
 * Returns the path of the source GLTF model in the storage bucket.
 */
export function getFurniturePrimaryModelPath(id: PrefixedId<'f'>) {
	return `${id}/original.gltf`;
}
