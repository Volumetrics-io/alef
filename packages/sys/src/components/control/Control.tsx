import cls from './Control.module.css';
import clsx from 'clsx';
import { Box, BoxProps } from '../box/Box.js';
import { forwardRef } from 'react';

export interface ControlProps extends BoxProps {
	focusWithin?: boolean;
	disabled?: boolean;
}

export const Control = forwardRef<HTMLDivElement, ControlProps>(function Control({ className, focusWithin, ...rest }, ref) {
	return (
		<Box
			className={clsx(
				cls.control,
				{
					[cls.focusWithin]: focusWithin,
				},
				className
			)}
			data-disabled={rest.disabled ? true : undefined}
			ref={ref}
			{...rest}
		/>
	);
});
