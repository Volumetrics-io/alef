import { useFurnitureModel } from '@/services/publicApi/furnitureHooks';
import { PrefixedId } from '@alef/common';
import { Clone, Outlines } from '@react-three/drei';
import { forwardRef } from 'react';
import { Group } from 'three';

export interface FurnitureModelProps {
	furnitureId: PrefixedId<'f'>;
	outline?: boolean;
	receiveShadow?: boolean;
	castShadow?: boolean;
}

export const FurnitureModel = forwardRef<Group, FurnitureModelProps>(function FurnitureModel({ furnitureId, outline, castShadow, receiveShadow }: FurnitureModelProps, ref) {
	const model = useFurnitureModel(furnitureId);

	if (!model) return null;

	return <Clone pointerEvents="none" object={model.scene as any} deep={true} castShadow={castShadow} receiveShadow={receiveShadow} ref={ref} inject={outline ? <Outlines thickness={1} color="hotpink" /> : null} />;
});
