import * as RadixDialog from '@radix-ui/react-dialog';
import { Link, LinkProps } from '@verdant-web/react-router';
import clsx from 'clsx';
import { forwardRef } from 'react';
import { withClassName } from '../../hocs/withClassName.js';
import { withProps } from '../../hocs/withProps.js';
import { Box, BoxProps } from '../box/Box.js';
import { Button } from '../button/Button.js';
import { Control } from '../control/Control.js';
import { Icon } from '../icon/Icon.js';
import { Logo } from '../logo/Logo.js';
import cls from './NavMenu.module.css';

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
							<Link to="/" aria-label="Main menu">
								<Logo style={{ width: 40, height: 'auto' }} />
							</Link>
						</RadixDialog.Title>
						<RadixDialog.Close asChild>
							<Button variant="action" color="ghost" aria-label="Close menu">
								<Icon name="x" />
							</Button>
						</RadixDialog.Close>
					</Box>
					{children}
				</RadixDialog.Content>
			</Box>
		</RadixDialog.Portal>
	);
});

export const NavMenuContentEnd = withClassName(
	withProps(Box, {
		p: 'squeeze',
		gapped: true,
		wrap: true,
		stacked: true,
		align: 'center',
	}),
	cls.contentEnd
);

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
		<Control asChild className={clsx(cls.item, className)}>
			<Link ref={ref} {...rest}>
				{children}
			</Link>
		</Control>
	);
});

export const NavMenuItemIcon = withClassName('div', cls.itemIcon);

export const NavMenu = Object.assign(NavMenuRoot, {
	Trigger: NavMenuTrigger,
	Content: NavMenuContent,
	ContentEnd: NavMenuContentEnd,
	Item: NavMenuItem,
	ItemIcon: NavMenuItemIcon,
	ItemLink: NavMenuItemLink,
});
