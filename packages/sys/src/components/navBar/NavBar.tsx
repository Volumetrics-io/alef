import clsx from 'clsx';
import { forwardRef, useEffect, useState } from 'react';
import { withProps } from '../../hocs/withProps.js';
import { useHeightGlobal } from '../../hooks/useHeightGlobal.js';
import { useMergedRef } from '../../hooks/useMergedRef.js';
import { Box, BoxProps } from '../box/Box.js';
import { Toolbar } from '../toolbar/Toolbar.js';
import cls from './NavBar.module.css';

export interface NavBarProps extends BoxProps {}

export const NavBarRoot = forwardRef<HTMLDivElement, NavBarProps>(function NavBar({ className, ...props }, ref) {
	const innerRef = useHeightGlobal('--nav-height');
	const [isVisible, setIsVisible] = useState(true);
	const [lastScrollY, setLastScrollY] = useState(0);

	useEffect(() => {
		const handleScroll = () => {
			const currentScrollY = window.scrollY;

			if (currentScrollY > lastScrollY) {
				// Scrolling down
				setIsVisible(false);
			} else {
				// Scrolling up
				setIsVisible(true);
			}

			setLastScrollY(currentScrollY);
		};

		window.addEventListener('scroll', handleScroll, { passive: true });

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	}, [lastScrollY]);

	const finalRef = useMergedRef(ref, innerRef);
	return <Toolbar gapped ref={finalRef} {...props} className={clsx(cls.root, className, { [cls.hidden]: !isVisible })} />;
});

export const NavBarStart = withProps(Box, {
	gapped: true,
	align: 'center',
});

export const NavBarEnd = withProps(Box, {
	gapped: true,
	align: 'center',
});

export const NavBar = Object.assign(NavBarRoot, {
	Start: NavBarStart,
	End: NavBarEnd,
});
