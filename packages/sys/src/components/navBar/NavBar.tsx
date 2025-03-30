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
	const [isAtBottom, setIsAtBottom] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			const currentScrollY = window.scrollY;
			const scrollDelta = Math.abs(currentScrollY - lastScrollY);
			const scrollThreshold = 5; // Minimum scroll amount to trigger hide/show

			// Check if we're at the bottom of the page
			const windowHeight = window.innerHeight;
			const documentHeight = document.documentElement.scrollHeight;
			const bottomOffset = 20; // Small buffer for bottom detection
			const reachedBottom = currentScrollY + windowHeight >= documentHeight - bottomOffset;

			setIsAtBottom(reachedBottom);

			// Always show navbar when at the top of the page (fixes iOS issue)
			if (currentScrollY <= 10) {
				setIsVisible(true);
			}
			// Only change visibility state when scrolling more than threshold and not at the bottom
			else if (scrollDelta >= scrollThreshold) {
				if (currentScrollY > lastScrollY && !reachedBottom) {
					// Scrolling down and not at bottom
					setIsVisible(false);
				} else if (currentScrollY < lastScrollY) {
					// Scrolling up
					setIsVisible(true);
				}
			}

			setLastScrollY(currentScrollY);
		};

		window.addEventListener('scroll', handleScroll, { passive: true });

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	}, [lastScrollY, isAtBottom]);

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
