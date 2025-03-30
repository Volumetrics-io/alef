import * as RadixDialog from '@radix-ui/react-dialog';
import clsx from 'clsx';
import { forwardRef } from 'react';
import { withClassName } from '../../hocs/withClassName.js';
import { withProps } from '../../hocs/withProps.js';
import { Control } from '../control/Control.js';
import cls from './NavMenu.module.css';
import { Box, BoxProps } from '../box/Box.js';
import { Logo } from '../logo/Logo.js';
import { Button, ButtonProps } from '../button/Button.js';
import { Link, LinkProps } from '@verdant-web/react-router';
import { XIcon } from 'lucide-react';

export const NavMenuRoot = withClassName(RadixDialog.Root, cls.root);
export const NavMenuTrigger = withClassName(withProps(RadixDialog.Trigger, { asChild: true }), cls.trigger);

export interface NavMenuContentProps extends RadixDialog.DialogContentProps {}

export const NavMenuContent = forwardRef<HTMLDivElement, NavMenuContentProps>(function NavMenuContent({ className, children }, ref) {
	return (
		<RadixDialog.Portal>
			<RadixDialog.Overlay />
			<Box className={cls.overlay}>
				<RadixDialog.Content data-side="left" ref={ref} className={clsx(cls.content, className)}>
					<Box className={cls.header} full="width" align="center" justify="between">
						<RadixDialog.Title>
							{' '}
							<Link to="/">
								{' '}
								<Logo style={{ width: 40, height: 'auto' }} />{' '}
							</Link>{' '}
						</RadixDialog.Title>
						<RadixDialog.Close asChild>
							<Button variant="action" color="ghost" float="top-right">
								<XIcon />
							</Button>
						</RadixDialog.Close>
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
		<Control ref={ref} asChild={asChild} className={clsx(cls.item, className)} {...rest}>
			{children}
		</Control>
	);
});

export interface NavMenuItemLinkProps extends LinkProps {}

export const NavMenuItemLink = forwardRef<HTMLAnchorElement, NavMenuItemLinkProps>(function NavMenuItemLink({ className, children, ...rest }, ref) {
	return (
		<Link ref={ref} className={clsx(cls.item, className)} {...rest}>
			{children}
		</Link>
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
