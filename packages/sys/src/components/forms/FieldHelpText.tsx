import { Text } from '@alef/sys';
import { withProps } from '../../hocs/withProps.js';

export const FieldHelpText = withProps(Text, {
	as: 'span',
	faded: true,
});
