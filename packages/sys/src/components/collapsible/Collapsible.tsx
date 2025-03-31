import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { forwardRef } from 'react';
import clsx from 'clsx';
import cls from './Collapsible.module.css';
import { Box, BoxProps } from '../box/Box';
import { Icon } from '../icon/Icon';

export interface CollapsibleRootProps extends BoxProps {}

export function CollapsibleRoot({ children, ...props }: CollapsibleRootProps) {
	return (
		<CollapsiblePrimitive.Root>
			<Box container className={clsx(cls.root, props.className)} {...props}>
				{children}
			</Box>
		</CollapsiblePrimitive.Root>
	);
}

export const CollapsibleTrigger = forwardRef<HTMLButtonElement, CollapsiblePrimitive.CollapsibleTriggerProps>(function CollapsibleTrigger(props, ref) {
	return (
		<Box full>
			<CollapsiblePrimitive.Trigger className={clsx(cls.trigger)} {...props} ref={ref}>
				{props.children}
				<Icon name="chevron-down" />
			</CollapsiblePrimitive.Trigger>
		</Box>
	);
});

export const CollapsibleContent = forwardRef<HTMLDivElement, CollapsiblePrimitive.CollapsibleContentProps>(function CollapsibleContent(props, ref) {
	return <CollapsiblePrimitive.Content {...props} className={clsx(cls.content)} ref={ref} />;
});

export const Collapsible = Object.assign(CollapsibleRoot, {
	Trigger: CollapsibleTrigger,
	Content: CollapsibleContent,
});
