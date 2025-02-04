import { useFurnitureModel } from '@/services/publicApi/furnitureHooks';
import { PrefixedId } from '@alef/common';
import { Clone, Outlines } from '@react-three/drei';
import { forwardRef } from 'react';
import { Group } from 'three';

export interface FurnitureModelProps {
	furnitureId: PrefixedId<'f'>;
	outline?: boolean;
}

export const FurnitureModel = forwardRef<Group, FurnitureModelProps>(function FurnitureModel({ furnitureId, outline }: FurnitureModelProps, ref) {
	const model = useFurnitureModel(furnitureId);

	if (!model) return null;

	return <Clone object={model.scene as any} castShadow receiveShadow ref={ref} inject={outline ? <Outlines thickness={1} color="hotpink" /> : null} />;
});
