import { withProps } from '@/hocs/withProps.tsx';
import { Text } from '@alef/sys';

export const FieldHelpText = withProps(Text, {
	as: 'span',
	faded: true,
});
