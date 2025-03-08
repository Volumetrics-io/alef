import { Container, ContainerProperties } from "@react-three/uikit";
import { animated, SpringValue, useSpring, config } from "@react-spring/three";
import { Surface } from "./Surface";
import { colors, getColorForAnimation } from "./theme";
import { useState } from "react";

export type AnimationProps = {
    from: ContainerProperties
    to: ContainerProperties
}

function StaticContainer({ children, ...props }: ContainerProperties & { children?: React.ReactNode }) {
	return (
		<Container {...props}>
			{children}
		</Container>
	);
}
export const AnimatedContainer = animated(StaticContainer);

export const AnimatedSurface = animated(Surface);

export const usePullAnimation = (spring: SpringValue<number>) => {
    return spring.to([0,1], [0, 3])
}

export const usePushAnimation = (spring: SpringValue<number>) => {
    return spring.to([0,1], [0, -3])
}

export const useWiggleAnimation = (spring: SpringValue<number>) => {
    return spring.to([0,0.25,0.5,0.75,1], [0, 1, 0, -1, 0])
}

export function AnimatedCursor({ disabled, externalAnimate, ...props }: ContainerProperties & { disabled?: boolean, externalAnimate?: number }) {
    const [animate, setAnimate] = useState(0)
    const { spring } = useSpring({ spring: externalAnimate ?? animate, config: config.default })
  
    const translateZ = usePullAnimation(spring)
  
    const startBackgroundColor = getColorForAnimation(colors.surface)
    const endBackgroundColor = getColorForAnimation(colors.hover)
  
    if (startBackgroundColor == null || endBackgroundColor == null) {
      throw new Error('startBackgroundColor or endBackgroundColor is null')
    }
  
    const startBorderColor = getColorForAnimation(colors.border)
    const endBorderColor = getColorForAnimation(colors.faded)
  
    if (startBorderColor == null || endBorderColor == null) {
      throw new Error('startBorderColor or endBorderColor is null')
    }
  
    const animateBackgroundColor = spring.to([0,1], [`#${startBackgroundColor.getHexString()}`, `#${endBackgroundColor.getHexString()}`])
    const animateBorderColor = spring.to([0,1], [`#${startBorderColor.getHexString()}`, `#${endBorderColor.getHexString()}`])
    
  
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
            setAnimate(Number(hover))
          }
        }}
        transformTranslateZ={disabled ? 0 : translateZ}
        {...props}
      />
    )
  }