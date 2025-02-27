import { Container, ContainerProperties, DefaultProperties } from '@react-three/uikit';
import { colors } from './theme';

const containerProps = {
	flexDirection: 'row' as const,
	flexWrap: 'wrap' as const,
	gap: 5,
	borderWidth: 1,
	borderColor: colors.border,
	borderRadius: 10,
	padding: 5,
	backgroundColor: colors.surface,
}

const defaultProps = {
	fontSize: 16,
	lineHeight: 24,
	color: colors.ink,

}

export function Surface({ children, ...props }: ContainerProperties & { children: React.ReactNode }) {
	return (
		<Container {...containerProps} {...props}>
			<DefaultProperties {...defaultProps}>
				{children}
			</DefaultProperties>
		</Container>
	);
}
