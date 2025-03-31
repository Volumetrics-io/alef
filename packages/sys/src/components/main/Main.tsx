import clsx from 'clsx';
import { Box, BoxProps } from '../box/Box.js';
import cls from './Main.module.css';
import { forwardRef } from 'react';

export interface MainProps extends BoxProps {
	forceNav?: boolean;
}

export const Main = forwardRef<HTMLDivElement, MainProps>(function Main({ className, forceNav, ...props }, ref) {
	return <Box ref={ref} {...props} stacked background="paper" className={clsx(cls.root, forceNav && cls.forceNav, className)} />;
});
