import clsx from 'clsx';
import { forwardRef, useCallback, useRef } from 'react';
import { Box, BoxProps } from '../box/Box.js';
import cls from './ScrollArea.module.css';

export interface ScrollAreaProps extends BoxProps {
	direction?: 'horizontal' | 'vertical' | 'both';
}

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea({ children, onScroll, onScrollCapture, className, direction, ...rest }, ref) {
	const stableOnScroll = useRef(onScroll);
	stableOnScroll.current = onScroll;
	const internalOnScroll = useCallback(
		(event: React.UIEvent<HTMLDivElement>) => {
			const verticalScrollValue = event.currentTarget.scrollTop > 10 ? 'true' : 'false';
			if (event.currentTarget.getAttribute('data-scrolled-vertical') !== verticalScrollValue) {
				event.currentTarget.setAttribute('data-scrolled-vertical', verticalScrollValue);
			}
			stableOnScroll.current?.(event);
		},
		[stableOnScroll]
	);
	return (
		<Box
			stacked
			className={clsx(
				cls.root,
				className,
				{
					[cls.horizontal]: direction === 'horizontal',
					[cls.both]: direction === 'both',
				},
				'scrollable'
			)}
			onScroll={internalOnScroll}
			{...rest}
			ref={ref}
		>
			{children}
		</Box>
	);
});
