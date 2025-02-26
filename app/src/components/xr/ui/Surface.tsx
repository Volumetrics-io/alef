import { withProps } from '@alef/sys';
import { Container } from '@react-three/uikit';
import { colors } from '@react-three/uikit-default';

export const Surface = withProps(Container, {
	flexDirection: 'row',
	flexWrap: 'wrap',
	gap: 5,
	borderWidth: 1,
	borderColor: colors.border,
	borderRadius: 10,
	padding: 10,
	backgroundColor: colors.background,
});
