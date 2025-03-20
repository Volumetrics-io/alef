import { usePerformanceStore } from '@/stores/performanceStore';
import { config, useSpring, useSpringRef } from '@react-spring/web';
import { ContainerProperties, ContainerRef } from '@react-three/uikit';
import { ReactNode, RefAttributes, forwardRef, useState } from 'react';
import { AnimatedContainer, AnimatedCursor } from './Animations.js';
import { colors, getColorForAnimation } from './theme.js';
export type SwitchProperties = Omit<ContainerProperties, 'children'> & {
	defaultChecked?: boolean;
	checked?: boolean;
	disabled?: boolean;
	onCheckedChange?(checked: boolean): void;
};

export const Switch: (props: SwitchProperties & RefAttributes<ContainerRef>) => ReactNode = forwardRef(
	({ defaultChecked, checked: providedChecked, disabled = false, onCheckedChange, ...props }, ref) => {
		const qualityLevel = usePerformanceStore((state) => state.qualityLevel);
		const [uncontrolled, setUncontrolled] = useState(defaultChecked ?? false);
		const checked = providedChecked ?? uncontrolled;

		const api = useSpringRef();
		const { spring: checkedSpring } = useSpring({ spring: Number(checked), config: config.default, ref: api });

		const position = checkedSpring.to([0, 1], [0, 15]);
		const width = checkedSpring.to([0, 0.5, 1], [20, 25, 20]);

		const startBackgroundColor = getColorForAnimation(colors.surface);
		const endBackgroundColor = getColorForAnimation(colors.focus);

		if (startBackgroundColor == null || endBackgroundColor == null) {
			throw new Error('startBackgroundColor or endBackgroundColor is null');
		}
		const animateBackgroundColor = checkedSpring.to([0, 1], [`#${startBackgroundColor.getHexString()}`, `#${endBackgroundColor.getHexString()}`]);

		return (
			<AnimatedContainer
				height={28}
				width={44}
				flexShrink={0}
				flexDirection="row"
				padding={2}
				alignItems="center"
				backgroundOpacity={disabled ? 0.5 : undefined}
				borderRadius={1000}
				borderColor={disabled ? colors.faded : colors.border}
				borderWidth={2}
				backgroundColor={animateBackgroundColor}
				cursor={disabled ? undefined : 'pointer'}
				onHoverChange={(hover) => {
					if (qualityLevel === 'low') return;
					api.start({ spring: Number(hover) });
				}}
				onClick={
					disabled
						? undefined
						: () => {
								if (providedChecked == null) {
									setUncontrolled(!checked);
								}
								onCheckedChange?.(!checked);
							}
				}
				ref={ref}
				{...props}
			>
				<AnimatedCursor marginLeft={position} width={width} externalAnimate={checkedSpring} />
			</AnimatedContainer>
		);
	}
);
