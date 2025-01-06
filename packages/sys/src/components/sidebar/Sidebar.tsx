import clsx from 'clsx';
import { forwardRef } from 'react';
import { withClassName } from '../../hocs/withClassName.js';
import { Box, BoxProps } from '../box/Box.js';
import { Control } from '../control/Control.js';
import cls from './Sidebar.module.css';

export interface SidebarRootProps extends BoxProps {
	collapsed?: boolean;
}

export const SidebarRoot = forwardRef<HTMLDivElement, SidebarRootProps>(function SidebarRoot({ className, collapsed, ...props }, ref) {
	return <Box ref={ref} stacked full background="paper" data-collapsed={collapsed} className={clsx(cls.root, className)} {...props} />;
});

export const SidebarItem = withClassName(Control, cls.item);

export const SidebarLabel = withClassName(Box, cls.label);

export const Sidebar = Object.assign(SidebarRoot, {
	Item: SidebarItem,
	Label: SidebarLabel,
});
