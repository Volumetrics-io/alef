import { colors, getColorForAnimation } from "./theme";
import { borderRadius } from "@react-three/uikit-default";
import { RefAttributes, useCallback, useRef, useEffect, useState } from "react";
import { ReactNode } from "react";
import { forwardRef } from "react";
import {  ContainerRef, DefaultProperties, ContainerProperties, AllOptionalProperties } from "@react-three/uikit";
import { PositionalAudio } from "@react-three/drei";
import { Color, PositionalAudio as PositionalAudioType } from "three";
import { ThreeEvent } from "@react-three/fiber";
import { useSpring, config } from "@react-spring/three";
import { AnimatedContainer, AnimationProps, usePullAnimation } from "./Animations";


const buttonVariants = {
    default: {
      containerHoverProps: {
        borderColor: colors.faded,
      },
      containerProps: {
        borderColor: colors.border,
        borderWidth: 1,
      },
      defaultProps: {
        color: colors.ink,
      },
      animationProps: {
        from: {
          backgroundColor: colors.surface,
        },
        to: {
          backgroundColor: colors.hover,
        }
      }
    },
    link: { 
      containerHoverProps: {
        borderColor: colors.attentionFaded,
      },
      containerProps: {
          borderColor: colors.attentionBorder,
          borderWidth: 1,
      },
      defaultProps: {
          color: colors.attentionInk,
      },
      animationProps: {
        from: {
          backgroundColor: colors.attentionSurface,
        },
        to: {
          backgroundColor: colors.attentionHover,
        }
      }
    },
    secondary: { 
      containerHoverProps: {
        borderColor: colors.secondaryFaded
      },
      containerProps: {
          borderColor: colors.secondaryBorder,
          borderWidth: 1,
      },
      defaultProps: {
          color: colors.secondaryInk,
      },
      animationProps: {
        from: {
          backgroundColor: colors.secondarySurface,
        },
        to: {
          backgroundColor: colors.secondaryHover,
        }
      }
    },
    destructive: {
      containerHoverProps: {
        borderColor: colors.destructiveFaded,
      },
      containerProps: {
        borderColor: colors.destructiveBorder,
        borderWidth: 1,
      },
      defaultProps: {
        color: colors.destructiveInk,
      },
      animationProps: {
        from: {
          backgroundColor: colors.destructiveSurface,
        },
        to: {
          backgroundColor: colors.destructiveHover,
        }
      }
    },
    ghost: {
      containerHoverProps: {
        borderColor: colors.faded,
      },
      containerProps: {
      },
      defaultProps: {
        color: colors.ink,
      },
      animationProps: {
        from: {
          backgroundColor: colors.surface,
        },
        to: {
          backgroundColor: colors.hover,
        }
      }
    },
  }

  const buttonSizes = {
    default: { height: 40, paddingX: 16},
    sm: { height: 36, paddingX: 12 },
    lg: { height: 42, paddingX: 32 },
    icon: { height: 42, width: 42 },
  } satisfies { [Key in string]: ContainerProperties }

  const audioDistance = {
    default: 1,
    sm: 0.5,
    lg: 1,
    icon: 0.25,
  }
  
  export type ButtonProperties = ContainerProperties & {
    animated?: boolean
    variant?: keyof typeof buttonVariants
    size?: keyof typeof buttonSizes
    disabled?: boolean
  }
  
  export const Button: (props: ButtonProperties & RefAttributes<ContainerRef>) => ReactNode = forwardRef(
    ({ children, variant = 'default', size = 'default', disabled = false, hover, animated = true, ...props }) => {
      const {
        containerProps,
        defaultProps,
        containerHoverProps,
        animationProps,
      }: {
        containerHoverProps?: ContainerProperties['hover']
        containerProps?: Omit<ContainerProperties, 'hover'>
        defaultProps?: AllOptionalProperties
        animationProps?: AnimationProps
      } = buttonVariants[variant]
      const sizeProps = buttonSizes[size]

      const [active, setActive] = useState(0);

      const audioRef = useRef<PositionalAudioType>(null)

      const { spring } = useSpring({ spring: active, config: config.default });

      const transformTranslateZ = usePullAnimation(spring)
      
      const startColor = getColorForAnimation(animationProps?.from?.backgroundColor) as Color
      const endColor = getColorForAnimation(animationProps?.to?.backgroundColor) as Color

      const backgroundColor = spring.to([0,1], [`#${startColor.getHexString()}`, `#${endColor.getHexString()}`])

      // Clean up audio when component unmounts
      useEffect(() => {
        return () => {
          // Stop audio when component unmounts
          if (audioRef.current) {
            audioRef.current.stop();
          }
        };
      }, []);

      const onHoverChange = useCallback((hover: boolean) => {
        props.onHoverChange?.(hover);
        setActive(Number(hover));
      }, [props]);

      const onClick = useCallback((e: ThreeEvent<MouseEvent>) => {
        // Stop any currently playing audio before playing again
        if (audioRef.current) {
          if (audioRef.current.isPlaying) {
            audioRef.current.stop();
          }
          audioRef.current.play();
        }
        props.onClick?.(e);
        setActive(0);

      }, [props]);
  
      return (
        <AnimatedContainer
          transformTranslateZ={transformTranslateZ}
          borderRadius={borderRadius.md}
          alignItems="center"
          justifyContent="center"
          {...containerProps}
          {...sizeProps}
          borderOpacity={disabled ? 0.5 : undefined}
          backgroundOpacity={disabled ? 0.5 : undefined}
          cursor={disabled ? undefined : 'pointer'}
          flexDirection="row"
          backgroundColor={backgroundColor}
          hover={{
            ...containerHoverProps,
            ...hover,
          }}
          {...props}
          onClick={onClick}
          onHoverChange={onHoverChange}
        >
          <PositionalAudio
            url={`./audio/click.webm`}
            distance={audioDistance[size]}
            autoplay={false}
            loop={false}
            ref={audioRef}
          />
          <DefaultProperties
            fontSize={16}
            lineHeight={24}
            fontWeight="medium"
            wordBreak="keep-all"
            {...defaultProps}
            opacity={disabled ? 0.5 : undefined}
          >
            {children}
          </DefaultProperties>
        </AnimatedContainer>
      )
    },
  )
