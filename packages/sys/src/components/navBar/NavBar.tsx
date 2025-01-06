import { forwardRef } from 'react';
import { Box, BoxProps } from '../box/Box.js';
import { useMergedRef } from '../../hooks/useMergedRef.js';
import { withProps } from '../../hocs/withProps.js';
import clsx from 'clsx';
import cls from './NavBar.module.css';
import { Toolbar } from '../toolbar/Toolbar.js';
import { useHeightGlobal } from '../../hooks/useHeightGlobal.js';

export interface NavBarProps extends BoxProps {}

export const NavBarRoot = forwardRef<HTMLDivElement, NavBarProps>(function NavBar({ className, ...props }, ref) {
	const innerRef = useHeightGlobal('--nav-height');

	const finalRef = useMergedRef(ref, innerRef);
	return <Toolbar gapped ref={finalRef} {...props} className={clsx(cls.root, className)} />;
});

export const NavBarStart = withProps(Box, {
	gapped: true,
});

export const NavBarEnd = withProps(Box, {
	gapped: true,
});

export const NavBar = Object.assign(NavBarRoot, {
	Start: NavBarStart,
	End: NavBarEnd,
});
