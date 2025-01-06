import { withClassName } from '../../hocs/withClassName.js';
import { withProps } from '../../hocs/withProps.js';
import { Box, BoxProps } from '../box/Box.js';
import cls from './Toolbar.module.css';

export const Toolbar = withClassName(withProps(Box, { gapped: true, align: 'center' }), cls.root);
export type ToolbarProps = BoxProps;
