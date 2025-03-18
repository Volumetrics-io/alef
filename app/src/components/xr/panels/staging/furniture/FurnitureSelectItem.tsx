import { AnimatedSurface, usePullAnimation } from '@/components/xr/ui/Animations';
import { colors, getColorForAnimation } from '@/components/xr/ui/theme';
import { FurnitureItem } from '@/services/publicApi/furnitureHooks';
import { useIsSelectedModelId, useSetSelectedModelId } from '@/stores/editorStore';
import { usePerformanceStore } from '@/stores/performanceStore';
import { config, useSpring, useSpringRef } from '@react-spring/three';
import { Image } from '@react-three/uikit';
import { Suspense } from 'react';

export function FurnitureSelectItem({ furnitureItem }: { furnitureItem: FurnitureItem }) {
	const perfMode = usePerformanceStore((state) => state.perfMode);
	const setSelectedModelId = useSetSelectedModelId();
	const isSelected = useIsSelectedModelId(furnitureItem.id);

	const api = useSpringRef();
	const { value } = useSpring({
		value: 0,
		config: config.default,
		ref: api,
	});

	const onClick = () => {
		setSelectedModelId(furnitureItem.id);
	};

	const handleHover = (isHovered: boolean) => {
		if (perfMode) return;
		if (isSelected) return;
		api.start({ value: Number(isHovered) });
	};

	const transformTranslateZ = usePullAnimation(value);

	const startBorderColor = getColorForAnimation(colors.border);
	const endBorderColor = getColorForAnimation(colors.faded);

	if (!startBorderColor || !endBorderColor) {
		return null;
	}

	const borderColor = value.to([0, 1], [`#${startBorderColor.getHexString()}`, `#${endBorderColor.getHexString()}`]);

	const startBackgroundColor = getColorForAnimation(colors.paper);
	const endBackgroundColor = getColorForAnimation(colors.hover);

	if (!startBackgroundColor || !endBackgroundColor) {
		return null;
	}

	const backgroundColor = value.to([0, 1], [`#${startBackgroundColor.getHexString()}`, `#${endBackgroundColor.getHexString()}`]);

	return (
		<AnimatedSurface
			onHoverChange={handleHover}
			onClick={onClick}
			transformTranslateZ={transformTranslateZ}
			borderColor={isSelected ? colors.focus : borderColor}
			backgroundColor={backgroundColor}
			height="48%"
			minWidth="32%"
			flexDirection="column"
			flexWrap="no-wrap"
			gap={3}
			flexShrink={0}
			alignItems="center"
		>
			<Suspense>
				<Image pointerEvents="none" src={`${import.meta.env.VITE_PUBLIC_API_ORIGIN}/furniture/${furnitureItem.id}/image.jpg`} width="100%" height="100%" objectFit="cover" />
			</Suspense>
		</AnimatedSurface>
	);
}
