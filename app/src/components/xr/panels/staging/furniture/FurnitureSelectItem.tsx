import { AnimatedSurface, usePullAnimation } from '@/components/xr/ui/Animations';
import { colors, getColorForAnimation } from '@/components/xr/ui/theme';
import { FurnitureItem } from '@/services/publicApi/furnitureHooks';
import { useAddFurniture } from '@/stores/roomStore';
import { config, useSpring, useSpringRef } from '@react-spring/three';
import { invalidate } from '@react-three/fiber';
import { Image } from '@react-three/uikit';
import { usePerformanceStore } from '@/stores/performanceStore';
export function FurnitureSelectItem({ furnitureItem }: { furnitureItem: FurnitureItem }) {
	const perfMode = usePerformanceStore((state) => state.perfMode);
	const api = useSpringRef();
	const { spring } = useSpring({
		spring: 0,
		config: config.default,
		ref: api,
		onChange: () => invalidate(),
	});

	const addFurniture = useAddFurniture();

	const addFurnitureAtCenterOfFloorClosestToUser = () => {
		addFurniture({
			furnitureId: furnitureItem.id,
			position: { x: 0, y: 0, z: 0 },
			rotation: { x: 0, y: 0, z: 0, w: 1 },
		});
	};

	const handleHover = (isHovered: boolean) => {
		if (perfMode) return;
		api.start({ spring: Number(isHovered) });
	};

	const transformTranslateZ = usePullAnimation(spring);

	const startBorderColor = getColorForAnimation(colors.border);
	const endBorderColor = getColorForAnimation(colors.faded);

	if (!startBorderColor || !endBorderColor) {
		return null;
	}

	const borderColor = spring.to([0, 1], [`#${startBorderColor.getHexString()}`, `#${endBorderColor.getHexString()}`]);

	const startBackgroundColor = getColorForAnimation(colors.paper);
	const endBackgroundColor = getColorForAnimation(colors.hover);

	if (!startBackgroundColor || !endBackgroundColor) {
		return null;
	}

	const backgroundColor = spring.to([0, 1], [`#${startBackgroundColor.getHexString()}`, `#${endBackgroundColor.getHexString()}`]);

	return (
		<AnimatedSurface
			onHoverChange={handleHover}
			onClick={addFurnitureAtCenterOfFloorClosestToUser}
			transformTranslateZ={transformTranslateZ}
			borderColor={borderColor}
			backgroundColor={backgroundColor}
			height="48%"
			minWidth="32%"
			flexDirection="column"
			flexWrap="no-wrap"
			gap={3}
			flexShrink={0}
			alignItems="center"
		>
			<Image pointerEvents="none" src={`${import.meta.env.VITE_PUBLIC_API_ORIGIN}/furniture/${furnitureItem.id}/image.jpg`} width="100%" height="100%" objectFit="cover" />
		</AnimatedSurface>
	);
}
