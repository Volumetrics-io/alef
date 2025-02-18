import clsx from 'clsx';
import { forwardRef } from 'react';
import { withClassName } from '../../hocs/withClassName.js';
import { withProps } from '../../hocs/withProps.js';
import { useHeightGlobal } from '../../hooks/useHeightGlobal.js';
import { useMergedRef } from '../../hooks/useMergedRef.js';
import { Box, BoxProps } from '../box/Box.js';
import { Heading, HeadingProps } from '../heading/Heading.js';
import { Text } from '../text/Text.js';
import cls from './Hero.module.css';

export interface HeroProps extends Omit<BoxProps, 'padded' | 'p'> {
	big?: boolean;
	padded?: boolean;
	forceNav?: boolean;
}

export const HeroRoot = forwardRef<HTMLDivElement, HeroProps>(function HeroRoot({ className, big, padded, forceNav, ...props }, ref) {
	const innerRef = useHeightGlobal('--hero-height');
	const finalRef = useMergedRef(ref, innerRef);
	return <Box ref={finalRef} {...props} className={clsx(cls.root, big && cls.big, padded === false && cls.noPadding, forceNav && cls.forceNav, className)} />;
});

export const HeroTitle = forwardRef<HTMLHeadingElement, HeadingProps>(function HeroTitle({ className, ...props }, ref) {
	return <Heading ref={ref} {...props} className={clsx(cls.title, className)} />;
});

export const HeroTagline = withClassName(withProps(Text, { as: 'p' }), cls.tagline);

export const HeroBackdrop = withClassName('div', cls.backdrop);

export const HeroDimmer = withClassName('div', cls.dimmer);

export const Hero = Object.assign(HeroRoot, {
	Title: HeroTitle,
	Tagline: HeroTagline,
	Backdrop: HeroBackdrop,
	Dimmer: HeroDimmer,
});
