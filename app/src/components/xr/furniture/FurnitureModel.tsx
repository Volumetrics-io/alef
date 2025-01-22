import { useFurnitureModel } from '@/services/publicApi/furnitureHooks';
import { PrefixedId } from '@alef/common';
import { Clone } from '@react-three/drei';
import { forwardRef } from 'react';
import { Group } from 'three';

export interface FurnitureModelProps {
	furnitureId: PrefixedId<'f'>;
}

export const FurnitureModel = forwardRef<Group, FurnitureModelProps>(function FurnitureModel({ furnitureId }: FurnitureModelProps, ref) {
	const model = useFurnitureModel(furnitureId);

	if (!model) return null;

	return <Clone object={model.scene} ref={ref} />;
});
