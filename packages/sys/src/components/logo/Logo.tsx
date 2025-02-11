import { withProps } from '../../hocs/withProps.js';

export const Logo = withProps('img', {
	src: '/icons/192.png',
	width: 32,
	height: 32,
});
