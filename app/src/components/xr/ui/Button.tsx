import { colors } from "./theme";
import { borderRadius } from "@react-three/uikit-default";
import { RefAttributes } from "react";
import { ReactNode } from "react";
import { forwardRef } from "react";
import { Container, ContainerRef, DefaultProperties, ContainerProperties, AllOptionalProperties } from "@react-three/uikit";

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
        borderColor: colors.secondaryFaded,
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
    default: { height: 40, paddingX: 16, paddingY: 8 },
    sm: { height: 36, paddingX: 12 },
    lg: { height: 42, paddingX: 32 },
    icon: { height: 40, width: 40 },
  } satisfies { [Key in string]: ContainerProperties }
  
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
        >
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
