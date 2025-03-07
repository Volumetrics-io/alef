import { FurnitureItem } from '@/services/publicApi/furnitureHooks';
import { useAddFurniture } from '@/stores/roomStore';
import { Container, Image } from '@react-three/uikit';
import { PlusIcon } from '@react-three/uikit-lucide';
import { useState } from 'react';
import { Button } from '@/components/xr/ui/Button';
import { colors } from '@/components/xr/ui/theme';
import { AnimatedSurface, usePullAnimation } from '@/components/xr/ui/Animations';
import { useSpring, config } from '@react-spring/three';
export function FurnitureSelectItem({ furnitureItem }: { furnitureItem: FurnitureItem }) {
	const [hovered, setHovered] = useState(0);

	const { spring } = useSpring({ spring: hovered, config: config.default });

	const transformTranslateZ = usePullAnimation(spring)

	return (
		<AnimatedSurface
			transformTranslateZ={transformTranslateZ}
			height="48%"
			minWidth="32%"
			flexDirection="column"
			flexWrap="no-wrap"
			gap={3}
			flexShrink={0}
			alignItems="center"
			onHoverChange={(hovered) => setHovered(Number(hovered))}
		>
			<Container
				flexDirection="column"
				alignItems="center"
				justifyContent="center"
				backgroundColor={colors.paper}
				borderRadius={5}
				width="100%"
			>
				{hovered && <FurnitureAddButton furnitureItem={furnitureItem} />}
				<Image src={`${import.meta.env.VITE_PUBLIC_API_ORIGIN}/furniture/${furnitureItem.id}/image.jpg`} 
				width="100%" 
				height="100%"
				objectFit="cover" />
			</Container>
		</AnimatedSurface>
	);
}

function FurnitureAddButton({ furnitureItem }: { furnitureItem: FurnitureItem }) {
	const addFurniture = useAddFurniture();
	return (
		<Button
			variant="link"
			width={30}
			height={30}
			padding={4}
			zIndexOffset={10}
			positionType="absolute"
			positionBottom={6}
			positionRight={6}
			onClick={() =>
				addFurniture({
					furnitureId: furnitureItem.id,
					position: { x: 0, y: 0, z: 0 },
					rotation: { x: 0, y: 0, z: 0, w: 1 },
				})}
		>
			<PlusIcon />
		</Button>
	);
}