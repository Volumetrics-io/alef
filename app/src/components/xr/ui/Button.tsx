import { colors } from "./theme";
import { borderRadius } from "@react-three/uikit-default";
import { RefAttributes, useCallback, useRef, useEffect } from "react";
import { ReactNode } from "react";
import { forwardRef } from "react";
import { Container, ContainerRef, DefaultProperties, ContainerProperties, AllOptionalProperties } from "@react-three/uikit";
import { PositionalAudio } from "@react-three/drei";
import { PositionalAudio as PositionalAudioType } from "three";
import { ThreeEvent } from "@react-three/fiber";
const buttonVariants = {
    default: {
      containerHoverProps: {
        backgroundColor: colors.hover,
        borderColor: colors.faded,
      },
      containerProps: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
      },
      defaultProps: {
        color: colors.ink,
      },
    },
    link: { 
      containerHoverProps: {
        backgroundColor: colors.attentionHover,
        borderColor: colors.attentionFaded,
      },
      containerProps: {
          backgroundColor: colors.attentionSurface,
          borderColor: colors.attentionBorder,
          borderWidth: 1,
      },
      defaultProps: {
          color: colors.attentionInk,
      },
    },
    secondary: { 
      containerHoverProps: {
        backgroundColor: colors.secondaryHover,
        borderColor: colors.secondaryFaded
      },
      containerProps: {
          backgroundColor: colors.secondarySurface,
          borderColor: colors.secondaryBorder,
          borderWidth: 1,
      },
      defaultProps: {
          color: colors.secondaryInk,
      },
    },
    destructive: {
      containerHoverProps: {
        backgroundColor: colors.destructiveHover,
        borderColor: colors.destructiveFaded,
      },
      containerProps: {
        backgroundColor: colors.destructiveSurface,
        borderColor: colors.destructiveBorder,
        borderWidth: 1,
      },
      defaultProps: {
        color: colors.destructiveInk,
      },
    },
    outline: {
      containerHoverProps: {
        borderColor: colors.faded,
      },
      containerProps: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
      },
      defaultProps: {
        color: colors.ink,
      },
    },
    ghost: {
      containerHoverProps: {
        backgroundColor: colors.hover,
        borderColor: colors.faded,
      },
      containerProps: {
        backgroundColor: colors.surface,
      },
      defaultProps: {
        color: colors.ink,
      },
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
    variant?: keyof typeof buttonVariants
    size?: keyof typeof buttonSizes
    disabled?: boolean
  }
  
  export const Button: (props: ButtonProperties & RefAttributes<ContainerRef>) => ReactNode = forwardRef(
    ({ children, variant = 'default', size = 'default', disabled = false, hover, ...props }, ref) => {
      const {
        containerProps,
        defaultProps,
        containerHoverProps,
      }: {
        containerHoverProps?: ContainerProperties['hover']
        containerProps?: Omit<ContainerProperties, 'hover'>
        defaultProps?: AllOptionalProperties
      } = buttonVariants[variant]
      const sizeProps = buttonSizes[size]

      const audioRef = useRef<PositionalAudioType>(null)

      // Clean up audio when component unmounts
      useEffect(() => {
        return () => {
          // Stop audio when component unmounts
          if (audioRef.current) {
            audioRef.current.stop();
          }
        };
      }, []);

      const onClick = useCallback((e: ThreeEvent<MouseEvent>) => {
        // Stop any currently playing audio before playing again
        if (audioRef.current) {
          if (audioRef.current.isPlaying) {
            audioRef.current.stop();
          }
          audioRef.current.play();
        }
        props.onClick?.(e);
      }, [props]);
  
      return (
        <Container
          borderRadius={borderRadius.md}
          alignItems="center"
          justifyContent="center"
          {...containerProps}
          {...sizeProps}
          borderOpacity={disabled ? 0.5 : undefined}
          backgroundOpacity={disabled ? 0.5 : undefined}
          cursor={disabled ? undefined : 'pointer'}
          flexDirection="row"
          hover={{
            ...containerHoverProps,
            ...hover,
          }}
          ref={ref}
          {...props}
          onClick={onClick}
        >
          <PositionalAudio
            url={`./audio/click.webm`}
            distance={audioDistance[size]}
            autoplay={false}
            loop={false}
            ref={audioRef}
          />
          <DefaultProperties
            fontSize={14}
            lineHeight={20}
            fontWeight="medium"
            wordBreak="keep-all"
            {...defaultProps}
            opacity={disabled ? 0.5 : undefined}
          >
            {children}
          </DefaultProperties>
        </Container>
      )
    },
  )
