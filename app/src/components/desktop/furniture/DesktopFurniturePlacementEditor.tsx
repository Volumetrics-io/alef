import { useFurniturePlacement } from '@/stores/propertyStore';
import { PrefixedId } from '@alef/common';
import { Box } from '@alef/sys';
import { DesktopSelectedFurnitureTools } from './DesktopFurnitureTools';

export interface DesktopFurniturePlacementEditorProps {
	id: PrefixedId<'fp'>;
}

export function DesktopFurniturePlacementEditor({ id: placementId }: DesktopFurniturePlacementEditorProps) {
	const placement = useFurniturePlacement(placementId);
	return (
		<Box stacked gapped>
			{placement && <img src={`${import.meta.env.VITE_PUBLIC_API_ORIGIN}/furniture/${placement.furnitureId}/image.jpg`} />}
			<DesktopSelectedFurnitureTools id={placementId} />
		</Box>
	);
}
