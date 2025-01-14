import { useFurnitureModel } from '@/services/publicApi/furnitureHooks';
import { PrefixedId } from '@alef/common';

export interface FurnitureModelProps {
	furnitureId: PrefixedId<'f'>;
}

export function FurnitureModel({ furnitureId }: FurnitureModelProps) {
	const model = useFurnitureModel(furnitureId);

	return <primitive object={model.scene} />;
}
