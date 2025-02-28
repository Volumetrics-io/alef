import { Surface } from '@/components/xr/ui/Surface';
import { FurnitureItem } from '@/services/publicApi/furnitureHooks';
import { useAddFurniture } from '@/stores/roomStore';
import { Container, Image } from '@react-three/uikit';
import { colors } from '@react-three/uikit-default';
import { PlusIcon } from '@react-three/uikit-lucide';
import { useState } from 'react';

export function FurnitureSelectItem({ furnitureItem }: { furnitureItem: FurnitureItem }) {
	const addFurniture = useAddFurniture();
	const [hovered, setHovered] = useState(false);
	return (
		<Surface
			height="48%"
			flexDirection="column"
			flexWrap="no-wrap"
			gap={3}
			flexShrink={0}
			alignItems="center"
			onHoverChange={(hovered) => setHovered(hovered)}
			onClick={() => {
				addFurniture({
					furnitureId: furnitureItem.id,
					position: { x: 0, y: 0, z: 0 },
					rotation: { x: 0, y: 0, z: 0, w: 1 },
				});
			}}
		>
			<Container flexDirection="column" alignItems="center" justifyContent="center" backgroundColor={colors.accent} borderRadius={5} width="100%">
				{hovered && <AddIndicator />}
				<Image src={`${import.meta.env.VITE_PUBLIC_API_ORIGIN}/furniture/${furnitureItem.id}/image.jpg`} width="100%" height="100%" objectFit="cover" />
			</Container>
		</Surface>
	);
}

function AddIndicator() {
	return (
		<Container
			zIndexOffset={10}
			height={30}
			width={30}
			padding={4}
			borderRadius={25}
			positionType="absolute"
			positionBottom={10}
			positionRight={10}
			backgroundColor={colors.primary}
		>
			<PlusIcon color={colors.primaryForeground} />
		</Container>
	);
}
