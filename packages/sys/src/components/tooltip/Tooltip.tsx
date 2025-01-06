import { forwardRef, ReactNode } from 'react';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import clsx from 'clsx';
import cls from './Tooltip.module.css';

export interface TooltipProps extends RadixTooltip.TooltipProps {
	className?: string;
	content: ReactNode;
}

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(function Tooltip({ children, className, content, ...rest }, ref) {
	return (
		<RadixTooltip.Root {...rest}>
			<RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
			<RadixTooltip.Portal>
				<RadixTooltip.Content ref={ref} className={clsx(cls.content, className)} sideOffset={5}>
					{content}
					<RadixTooltip.Arrow className={cls.arrow} />
				</RadixTooltip.Content>
			</RadixTooltip.Portal>
		</RadixTooltip.Root>
	);
});
