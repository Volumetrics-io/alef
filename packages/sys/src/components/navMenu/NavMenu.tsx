import * as RadixDialog from '@radix-ui/react-dialog';
import clsx from 'clsx';
import { forwardRef } from 'react';
import { withClassName } from '../../hocs/withClassName.js';
import { withProps } from '../../hocs/withProps.js';
import { Control } from '../control/Control.js';
import cls from './NavMenu.module.css';
import { Box, BoxProps } from '../box/Box.js';
import { Logo } from '../logo/Logo.js';
import { Icon } from '../icon/Icon.js';
import { Button, ButtonProps } from '../button/Button.js';
import { Link, LinkProps } from '@verdant-web/react-router';

export const NavMenuRoot = withClassName(RadixDialog.Root, cls.root);
export const NavMenuTrigger = withClassName(withProps(RadixDialog.Trigger, { asChild: true }), cls.trigger);

export interface NavMenuContentProps extends RadixDialog.DialogContentProps {}

export const NavMenuContent = forwardRef<HTMLDivElement, NavMenuContentProps>(function NavMenuContent({ className, children, ...rest }, ref) {
	return (
		<RadixDialog.Portal>
			<RadixDialog.Overlay />
			<Box className={cls.overlay}>
				<RadixDialog.Content data-side="left" ref={ref} className={clsx(cls.content, className)} {...rest}>
					<Box className={cls.header} full="width" align="center" justify="between">
						<RadixDialog.Title>
							{' '}
							<Link to="/">
								{' '}
								<Logo style={{ width: 40, height: 'auto' }} />{' '}
							</Link>{' '}
						</RadixDialog.Title>
						<NavMenuClose>
							<NavMenu.ItemIcon>
								<Icon name="x" />
							</NavMenu.ItemIcon>
						</NavMenuClose>
					</Box>
					{children}
				</RadixDialog.Content>
			</Box>
		</RadixDialog.Portal>
	);
});

export interface NavMenuItemProps extends BoxProps {
	className?: string;
	children: React.ReactNode;
	asChild?: boolean;
}

export const NavMenuItem = forwardRef<HTMLDivElement, NavMenuItemProps>(function NavMenuItem({ className, children, asChild, ...rest }, ref) {
	return (
		<Control asChild={asChild} className={clsx(cls.item, className)} {...rest}>
			{children}
		</Control>
	);
});

export interface NavMenuItemLinkProps extends LinkProps {}

export const NavMenuItemLink = forwardRef<HTMLAnchorElement, NavMenuItemLinkProps>(function NavMenuItemLink({ className, children, ...rest }, ref) {
	return (
		<Link className={clsx(cls.item, className)} {...rest}>
			{children}
		</Link>
	);
});

export interface NavMenuCloseProps extends ButtonProps {}

export const NavMenuClose = forwardRef<HTMLButtonElement, NavMenuCloseProps>(function NavMenuClose({ className, children, ...rest }, ref) {
	return (
		<RadixDialog.Close asChild>
			<Button ref={ref} color="ghost" {...rest}>
				{children}
			</Button>
		</RadixDialog.Close>
	);
});

export const NavMenuItemIcon = withClassName('div', cls.itemIcon);

export const NavMenu = Object.assign(NavMenuRoot, {
	Trigger: NavMenuTrigger,
	Content: NavMenuContent,
	Item: NavMenuItem,
	ItemIcon: NavMenuItemIcon,
	ItemLink: NavMenuItemLink,
});
