import clsx from 'clsx';
import { forwardRef } from 'react';
import { Box, BoxProps } from '../box/Box.js';
import cls from './Frame.module.css';

export interface FrameProps extends BoxProps {
	color?: 'primary' | 'error' | 'default';
}

export const Frame = forwardRef<HTMLDivElement, FrameProps>(function Frame({ className, ...props }, ref) {
	return (
		<Box
			clipped
			{...props}
			ref={ref}
			className={clsx(
				cls.frame,
				{
					[cls.colorPrimary]: props.color === 'primary',
					[cls.colorError]: props.color === 'error',
				},
				className
			)}
		/>
	);
});
