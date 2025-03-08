import { ContainerRef, ContainerProperties, Container } from '@react-three/uikit'
import { ReactNode, RefAttributes, forwardRef, useState } from 'react'
import { colors, getColorForAnimation } from './theme.js'
import { useSpring, config } from '@react-spring/three'
import { AnimatedContainer, AnimatedCursor } from './Animations.js'

export type SwitchProperties = Omit<ContainerProperties, 'children'> & {
  defaultChecked?: boolean
  checked?: boolean
  disabled?: boolean
  onCheckedChange?(checked: boolean): void
}

export const Switch: (props: SwitchProperties & RefAttributes<ContainerRef>) => ReactNode = forwardRef(
  ({ defaultChecked, checked: providedChecked, disabled = false, onCheckedChange, ...props }, ref) => {
    const [uncontrolled, setUncontrolled] = useState(defaultChecked ?? false)
    const checked = providedChecked ?? uncontrolled

    const [hoverAnimate, setHoverAnimate] = useState(0)

    const { spring: checkedSpring } = useSpring({ spring: Number(checked), config: config.default })

    const position = checkedSpring.to([0,1], [0, 15])
    const width = checkedSpring.to([0, 0.5, 1], [20, 25, 20])

    const startBackgroundColor = getColorForAnimation(colors.surface)
    const endBackgroundColor = getColorForAnimation(colors.focus)

    if (startBackgroundColor == null || endBackgroundColor == null) {
      throw new Error('startBackgroundColor or endBackgroundColor is null')
    }
    const animateBackgroundColor = checkedSpring.to([0,1], [`#${startBackgroundColor.getHexString()}`, `#${endBackgroundColor.getHexString()}`])
 


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
        onHoverChange={(hover) => setHoverAnimate(Number(hover))}
        onClick={
          disabled
            ? undefined
            : () => {
                if (providedChecked == null) {
                  setUncontrolled(!checked)
                }
                onCheckedChange?.(!checked)
              }
        }
        ref={ref}
        {...props}
      >
        <AnimatedCursor
          // @ts-ignore this works fine
          marginLeft={position}
          // @ts-ignore this works fine
          width={width}

          externalAnimate={hoverAnimate}
        />
      </AnimatedContainer>
    )
  },
)