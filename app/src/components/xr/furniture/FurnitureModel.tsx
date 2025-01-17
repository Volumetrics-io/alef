import { useFurnitureModel } from '@/services/publicApi/furnitureHooks';
import { PrefixedId } from '@alef/common';
import { Clone } from '@react-three/drei';

export interface FurnitureModelProps {
	furnitureId: PrefixedId<'f'>;
}

export function FurnitureModel({ furnitureId }: FurnitureModelProps) {
	const model = useFurnitureModel(furnitureId);

	if (!model) return null;

	// @ts-ignore
	return <Clone object={model.scene} />;
}
