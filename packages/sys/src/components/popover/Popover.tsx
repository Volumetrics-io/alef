import * as RadixPopover from '@radix-ui/react-popover';
import { forwardRef } from 'react';
import { withClassName } from '../../hocs/withClassName';
import cls from './Popover.module.css';

export const PopoverRoot = withClassName(RadixPopover.Root, cls.root);
export const PopoverTrigger = withClassName(RadixPopover.Trigger, cls.trigger);

export const PopoverContent = forwardRef<HTMLDivElement, RadixPopover.PopoverContentProps>(function PopoverContent({ children, ...props }, ref) {
	return (
		<RadixPopover.Portal>
			<RadixPopover.Content side="bottom" sideOffset={8} align="start" ref={ref} className={cls.content} {...props}>
				{children}
			</RadixPopover.Content>
		</RadixPopover.Portal>
	);
});

export const PopoverArrow = withClassName(RadixPopover.Arrow, cls.arrow);
export const PopoverAnchor = withClassName(RadixPopover.Anchor, cls.anchor);

export const Popover = Object.assign(PopoverRoot, {
	Trigger: PopoverTrigger,
	Content: PopoverContent,
	Arrow: PopoverArrow,
	Anchor: PopoverAnchor,
});
