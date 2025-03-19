import { usePerformanceStore } from '@/stores/performanceStore';
import { config, useSpring, useSpringRef } from '@react-spring/web';
import { PositionalAudio } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';
import { Container, ContainerProperties, DefaultProperties } from '@react-three/uikit';
import { borderRadius } from '@react-three/uikit-default';
import { useCallback, useEffect, useRef } from 'react';
import { PositionalAudio as PositionalAudioType } from 'three';
import { AnimatedContainer, usePullAnimation } from './Animations';
import { colors, getColorForAnimation } from './theme';
export interface SelectorProps {
	wrap?: boolean;
	size?: 'small' | 'medium';
}

const selectorSizeVariants = {
	small: {
		paddingY: 8,
		paddingX: 12,
		gap: 4,
	},
	medium: {
		paddingY: 12,
		paddingX: 16,
		gap: 8,
	},
};

export function Selector({ size = 'medium', children, ...props }: SelectorProps & ContainerProperties & { children: React.ReactNode }) {
	return (
		<Container backgroundColor={colors.selectionSurface} flexShrink={0} borderRadius={borderRadius.md} borderWidth={1} borderColor={colors.border} {...props}>
			<DefaultProperties {...selectorSizeVariants[size]}>{children}</DefaultProperties>
		</Container>
	);
}

const selectorItemSizeVariants = {
	small: {
		fontSize: 14,
		lineHeight: 20,
	},
	medium: {
		fontSize: 16,
		lineHeight: 24,
	},
};

export function SelectorItem({
	wrap = false,
	selected,
	size = 'medium',
	children,
	...props
}: ContainerProperties & { wrap?: boolean; selected: boolean; size?: 'small' | 'medium'; children: React.ReactNode }) {
	const perfMode = usePerformanceStore((state) => state.perfMode);
	const audioRef = useRef<PositionalAudioType>(null);

	const startColor = getColorForAnimation(colors.selectionSurface);
	const endColor = getColorForAnimation(colors.selectionHover);

	const api = useSpringRef();
	const { spring } = useSpring({
		spring: 0,
		config: config.stiff,
		ref: api,
	});

	const transformTranslateZ = usePullAnimation(spring);

	if (!startColor || !endColor) {
		return null;
	}

	const backgroundColor = spring.to([0, 1], [`#${startColor.getHexString()}`, `#${endColor.getHexString()}`]);

	useEffect(() => {
		return () => {
			// Stop audio when component unmounts
			if (audioRef.current) {
				audioRef.current.stop();
			}
		};
	}, []);

	const onClick = useCallback(
		(e: ThreeEvent<MouseEvent>) => {
			// Stop any currently playing audio before playing again
			if (audioRef.current) {
				if (audioRef.current.isPlaying) {
					audioRef.current.stop();
				}
				audioRef.current.play();
			}
			props.onClick?.(e);
			if (perfMode) return;
			api.start({ spring: 1 });
		},
		[props]
	);

	return (
		<AnimatedContainer
			transformTranslateZ={transformTranslateZ}
			borderRadius={borderRadius.md}
			backgroundColor={selected ? colors.selectionPress : backgroundColor}
			alignItems="center"
			flexDirection="row"
			justifyContent="flex-start"
			onHoverChange={(hover) => {
				if (perfMode) return;
				api.start({ spring: Number(hover) });
			}}
			{...props}
			onClick={onClick}
		>
			<PositionalAudio url={`./audio/click.webm`} distance={0.5} autoplay={false} loop={false} ref={audioRef} />
			<DefaultProperties padding={0} {...selectorItemSizeVariants[size]}>
				{children}
			</DefaultProperties>
		</AnimatedContainer>
	);
}
