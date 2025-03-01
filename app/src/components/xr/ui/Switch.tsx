import { ContainerRef, Container, ContainerProperties } from '@react-three/uikit'
import { ReactNode, RefAttributes, forwardRef, useState } from 'react'
import { colors } from './theme.js'

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
    return (
      <Container
        height={28}
        width={44}
        flexShrink={0}
        flexDirection="row"
        padding={2}
        alignItems="center"
        backgroundOpacity={disabled ? 0.5 : undefined}
        borderRadius={1000}
        borderColor={colors.border}
        borderWidth={2}
        backgroundColor={checked ? colors.focus : colors.surface}
        cursor={disabled ? undefined : 'pointer'}
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
        <Container
          width={20}
          height={20}
          borderRadius={1000}
          borderColor={colors.border}
          borderWidth={2}
          backgroundColor={colors.surface}
          marginLeft={checked ? "auto" : 0}
          marginRight={checked ? 0 : "auto"}
        />
      </Container>
    )
  },
)