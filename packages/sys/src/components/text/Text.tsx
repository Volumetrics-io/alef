import { forwardRef, HTMLAttributes } from 'react';
import { Box, BoxProps } from '../box/Box.js';
import clsx from 'clsx';
import cls from './Text.module.css';

export interface TextProps extends HTMLAttributes<HTMLSpanElement> {
	as?: 'span' | 'p' | 'div';
	strong?: boolean;
	faded?: boolean;
	tall?: boolean;
	pre?: boolean;
}

const TextRoot = forwardRef<HTMLElement, TextProps>(function Text({ className, strong, faded, tall, pre, as: Tag = 'span', ...props }, ref) {
	return (
		<Tag
			{...props}
			className={clsx(
				cls.root,
				{
					[cls.strong]: strong,
					[cls.faded]: faded,
					[cls.tall]: tall,
					[cls.pre]: pre,
				},
				className
			)}
			ref={ref as any}
		/>
	);
});

export const TextTwoColumns = forwardRef<HTMLDivElement, BoxProps>(function TextTwoColumns({ className, ...props }, ref) {
	return <Box {...props} ref={ref} className={clsx(cls.twoColumns, className)} />;
});

export const Text = Object.assign(TextRoot, {
	TwoColumns: TextTwoColumns,
});
