import clsx from 'clsx';
import { Box, BoxProps } from '../box/Box.js';
import cls from './Frame.module.css';
import { forwardRef } from 'react';

export interface FrameProps extends BoxProps {}

export const Frame = forwardRef<HTMLDivElement, FrameProps>(function Frame({ className, ...props }, ref) {
	return <Box clipped {...props} ref={ref} className={clsx(cls.frame, className)} />;
});
