import { useFurnitureDetails } from '@/services/publicApi/furnitureHooks';
import { Text, TextProps } from '@alef/sys';

export interface FurnitureNameProps extends TextProps {
	furnitureId: string;
}

export function FurnitureName({ furnitureId, ...rest }: FurnitureNameProps) {
	const { data } = useFurnitureDetails(furnitureId);

	return <Text {...rest}>{data?.name ?? '...'}</Text>;
}
