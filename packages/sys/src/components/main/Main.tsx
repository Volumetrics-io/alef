import { withClassName } from '../../hocs/withClassName.js';
import { withProps } from '../../hocs/withProps.js';
import { Box } from '../box/Box.js';
import cls from './Main.module.css';

export const Main = withClassName(
	withProps(Box, {
		stacked: true,
		background: 'paper',
	}),
	cls.root
);
