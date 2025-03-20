import { usePerformanceStore } from '@/stores/performanceStore';
import { animated, config, SpringValue, useSpring, useSpringRef } from '@react-spring/web';
import { Container, ContainerProperties } from '@react-three/uikit';
import { ComponentProps } from 'react';
import { Surface } from './Surface';
import { colors, getColorForAnimation } from './theme';

export type AnimationProps = {
	from: ContainerProperties;
	to: ContainerProperties;
};

export const AnimatedContainer = animated(Container);
export const AnimatedSurface = animated(Surface);

export const usePullAnimation = (spring: SpringValue<number>) => {
	return spring.to([0, 1], [0, 3]);
};

export const usePushAnimation = (spring: SpringValue<number>) => {
	return spring.to([0, 1], [0, -3]);
};

export const useWiggleAnimation = (spring: SpringValue<number>) => {
	return spring.to([0, 0.25, 0.5, 0.75, 1], [0, 1, 0, -1, 0]);
};

type AnimatedContainerProperties = ComponentProps<typeof AnimatedContainer>;
export function AnimatedCursor({ disabled, externalAnimate, ...props }: AnimatedContainerProperties & { disabled?: boolean; externalAnimate?: SpringValue<number> }) {
	const qualityLevel = usePerformanceStore((state) => state.qualityLevel);

	const api = useSpringRef();
	const { spring } = useSpring({
		spring: 0,
		config: config.default,
		ref: api,
	});

	const activeSpring = externalAnimate || spring;

	const translateZ = usePullAnimation(activeSpring);

	const startBackgroundColor = getColorForAnimation(colors.surface);
	const endBackgroundColor = getColorForAnimation(colors.hover);

	if (startBackgroundColor == null || endBackgroundColor == null) {
		throw new Error('startBackgroundColor or endBackgroundColor is null');
	}

	const startBorderColor = getColorForAnimation(colors.border);
	const endBorderColor = getColorForAnimation(colors.faded);

	if (startBorderColor == null || endBorderColor == null) {
		throw new Error('startBorderColor or endBorderColor is null');
	}

	const animateBackgroundColor = activeSpring.to([0, 1], [`#${startBackgroundColor.getHexString()}`, `#${endBackgroundColor.getHexString()}`]);
	const animateBorderColor = activeSpring.to([0, 1], [`#${startBorderColor.getHexString()}`, `#${endBorderColor.getHexString()}`]);

	return (
		<AnimatedContainer
			cursor="pointer"
			borderOpacity={disabled ? 0.5 : undefined}
			backgroundOpacity={disabled ? 0.5 : undefined}
			height={20}
			width={20}
			borderWidth={2}
			borderRadius={1000}
			borderColor={disabled ? colors.border : animateBorderColor}
			backgroundColor={disabled ? colors.surface : animateBackgroundColor}
			onHoverChange={(hover) => {
				if (externalAnimate == null) {
					if (qualityLevel === 'low') return;
					api.start({ spring: Number(hover) });
				}
			}}
			transformTranslateZ={disabled ? 0 : translateZ}
			{...props}
		/>
	);
}
