import { Container, ContainerRef, ContainerProperties } from '@react-three/uikit'
import { colors, getColorForAnimation } from './theme.js'
import { ReactNode, RefAttributes, forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { EventHandlers, ThreeEvent } from '@react-three/fiber/dist/declarations/src/core/events.js'
import { Vector3 } from 'three'
import { Signal, computed } from '@preact/signals-core'
import { config } from '@react-spring/three'
import { useSpring } from '@react-spring/three'
import { AnimatedContainer, AnimatedCursor } from './Animations'
import { readReactive } from '@pmndrs/uikit/internals'
const vectorHelper = new Vector3()

export type SliderProperties = {
  color?: string
  disabled?: boolean
  value?: Signal<number> | number
  defaultValue?: number
  onValueChange?(value: number): void
  min?: Signal<number> | number
  max?: Signal<number> | number
  step?: number
} & Omit<ContainerProperties, 'children'>

export const Slider: (props: SliderProperties & RefAttributes<ContainerRef>) => ReactNode = forwardRef(
  (
    { disabled = false, value: providedValue, defaultValue, onValueChange, min = 0, max = 100, step = 1, ...props },
    ref,
  ) => {
    const [uncontrolled, setUncontrolled] = useState(defaultValue)
    const value = providedValue ?? uncontrolled ?? 50
    const percentage = useMemo(
      () =>
        computed(() => {
          const range = readReactive(max) - readReactive(min)
          return `${(100 * readReactive(value)) / range}%` as const
        }),
      [min, max, value],
    )
    const internalRef = useRef<ContainerRef>(null)
    const onChange = useRef(onValueChange)
    onChange.current = onValueChange
    const hasProvidedValue = providedValue != null
    const handler = useMemo(() => {
      let downPointerId: number | undefined
      function setValue(e: ThreeEvent<PointerEvent>) {
        if (internalRef.current == null) {
          return
        }
        vectorHelper.copy(e.point)
        internalRef.current.interactionPanel.worldToLocal(vectorHelper)
        const minValue = readReactive(min)
        const maxValue = readReactive(max)
        const newValue = Math.min(
          Math.max(Math.round(((vectorHelper.x + 0.5) * (maxValue - minValue) + minValue) / step) * step, minValue),
          maxValue,
        )
        if (!hasProvidedValue) {
          setUncontrolled(newValue)
        }
        onChange.current?.(newValue)
        e.stopPropagation()
      }
      return {
        onPointerDown(e) {
          if (downPointerId != null) {
            return
          }
          downPointerId = e.pointerId
          setValue(e)
          ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
        },
        onPointerMove(e) {
          if (downPointerId != e.pointerId) {
            return
          }
          setValue(e)
        },
        onPointerUp(e) {
          if (downPointerId == null) {
            return
          }
          downPointerId = undefined
          e.stopPropagation()
        },
      } satisfies EventHandlers
    }, [max, min, hasProvidedValue, step])
    useImperativeHandle(ref, () => internalRef.current!)

    const [animate, setAnimate] = useState(0)

    const { spring: colorSpring } = useSpring({ spring: animate, config: config.default })

    const startBorderColor = getColorForAnimation(colors.border)
    const endBorderColor = getColorForAnimation(colors.faded)

    if (startBorderColor == null || endBorderColor == null) {
      throw new Error('startBorderColor or endBorderColor is null')
    }

    const animateBorderColor = colorSpring.to([0,1], [`#${startBorderColor.getHexString()}`, `#${endBorderColor.getHexString()}`])
 
    return (
      <Container
        {...(disabled ? {} : handler)}
        positionType="relative"
        flexDirection="column"
        height={28}
        width="100%"
        alignItems="center"
        ref={internalRef}
        onHoverChange={(hover) => setAnimate(Number(hover))}
        {...props}
      >
        <AnimatedContainer
            height={28}
            positionType="absolute"
            positionLeft={0}
            positionRight={0}
            flexGrow={1}
            borderRadius={1000}
            borderWidth={2}
            borderColor={disabled ? colors.faded : animateBorderColor}
            backgroundColor={colors.paper}
        >
            <AnimatedContainer height="100%" 
                flexDirection="row" 
                alignItems="center" 
                justifyContent="flex-end" 
                padding={2} 
                width={percentage} 
                borderRadius={1000} 
                borderColor={props.color ? colors.focus : undefined} 
                borderWidth={props.color ? 2 : 0}
                backgroundColor={props.color ?? colors.focus}
                >
            <AnimatedCursor disabled={disabled} />
            </AnimatedContainer>
        </AnimatedContainer>
      </Container>
    )
  },
)