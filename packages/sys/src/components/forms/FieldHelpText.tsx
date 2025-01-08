import { Text } from '@alef/sys';
import { withProps } from '../../hocs/withProps.jsx';

export const FieldHelpText = withProps(Text, {
	as: 'span',
	faded: true,
});
