import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import clsx from 'clsx';
import { forwardRef } from 'react';
import { withClassName } from '../../hocs/withClassName.js';
import { withProps } from '../../hocs/withProps.js';
import { Control } from '../control/Control.js';
import cls from './DropdownMenu.module.css';

export const DropdownMenuRoot = withClassName(RadixDropdownMenu.Root, cls.root);
export const DropdownMenuTrigger = withClassName(withProps(RadixDropdownMenu.Trigger, { asChild: true }), cls.trigger);

export interface DropdownMenuContentProps extends RadixDropdownMenu.DropdownMenuContentProps {}

export const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenuContentProps>(function DropdownMenuContent({ className, ...rest }, ref) {
	return (
		<RadixDropdownMenu.Portal>
			<RadixDropdownMenu.Content sideOffset={8} align="start" ref={ref} className={cls.content} {...rest} />
		</RadixDropdownMenu.Portal>
	);
});

export interface DropdownMenuItemProps extends RadixDropdownMenu.DropdownMenuItemProps {}

export const DropdownMenuItem = forwardRef<HTMLDivElement, DropdownMenuItemProps>(function DropdownMenuItem({ className, children, asChild, ...rest }, ref) {
	return (
		<RadixDropdownMenu.Item ref={ref} className={clsx(cls.item, className)} asChild {...rest}>
			<Control asChild={asChild}>{children}</Control>
		</RadixDropdownMenu.Item>
	);
});
export const DropdownMenuItemIcon = withClassName('div', cls.itemIcon);
export const DropdownMenuItemLabel = withClassName(RadixDropdownMenu.Label, cls.itemLabel);

export const DropdownMenuSeparator = withClassName(RadixDropdownMenu.Separator, cls.separator);

export const DropdownMenu = Object.assign(DropdownMenuRoot, {
	Trigger: DropdownMenuTrigger,
	Content: DropdownMenuContent,
	Item: DropdownMenuItem,
	ItemIcon: DropdownMenuItemIcon,
	ItemLabel: DropdownMenuItemLabel,
	Separator: DropdownMenuSeparator,
});
