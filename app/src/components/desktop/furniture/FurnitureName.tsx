import { useFurnitureDetails } from '@/services/publicApi/furnitureHooks';
import { PrefixedId } from '@alef/common';
import { Text, TextProps } from '@alef/sys';

export interface FurnitureNameProps extends TextProps {
	furnitureId: PrefixedId<'f'>;
}

export function FurnitureName({ furnitureId, ...rest }: FurnitureNameProps) {
	const { data } = useFurnitureDetails(furnitureId);

	return <Text {...rest}>{data?.name ?? '...'}</Text>;
}
