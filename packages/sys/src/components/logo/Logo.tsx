import { withClassName } from '../../hocs/withClassName.js';
import { withProps } from '../../hocs/withProps.js';
import cls from './Logo.module.css';

export const Logo = withClassName(
	withProps('img', {
		src: '/icons/192.png',
		width: 32,
		height: 32,
		alt: 'The Alef logo, a three dimensional rounded pyramid with polychromatic hues',
	}),
	cls.root
);
