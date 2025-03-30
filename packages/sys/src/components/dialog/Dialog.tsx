import * as DialogPrimitive from '@radix-ui/react-dialog';
import clsx from 'clsx';
import { XIcon } from 'lucide-react';
import { forwardRef } from 'react';
import { withClassName } from '../../hocs/withClassName.js';
import { withProps } from '../../hocs/withProps.js';
import { Box } from '../box/Box.js';
import { Button } from '../button/Button.js';
import { Frame } from '../frame/Frame.js';
import cls from './Dialog.module.css';

export const DialogRoot = withClassName(DialogPrimitive.Root, cls.root);

export const DialogClose = withClassName(DialogPrimitive.Close, cls.close);

export const DialogTitle = withClassName(DialogPrimitive.Title, cls.title);

export const DialogDescription = withClassName(DialogPrimitive.Description, cls.description);

export interface DialogContentProps extends DialogPrimitive.DialogContentProps {
	title: string;
	width?: 'medium' | 'large';
	container?: HTMLElement | null;
}

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(function DialogContent({ width, title, container, ...props }, ref) {
	const handleOutsidePointerDown = (e: Event) => {
		if (container && !container.contains(e.target as Node)) {
			e.preventDefault();
		}
	};

	return (
		<DialogPrimitive.Portal container={container}>
			<DialogPrimitive.Overlay className={cls.overlay} />
			<Box className={cls.contentContainer}>
				<Frame asChild padded stacked gapped elevated ref={ref}>
					<DialogPrimitive.Content className={clsx(cls.content, width === 'large' && cls.contentLarge)} onPointerDownOutside={handleOutsidePointerDown} {...props}>
						<Box>
							<DialogTitle>{title}</DialogTitle>
						</Box>
						<Dialog.Close asChild>
							<Button variant="action" color="ghost" float="top-right">
								<XIcon />
							</Button>
						</Dialog.Close>
						{props.children}
					</DialogPrimitive.Content>
				</Frame>
			</Box>
		</DialogPrimitive.Portal>
	);
});

export const DialogActions = withProps(Box, {
	spread: true,
});

export interface DialogTriggerProps extends DialogPrimitive.DialogTriggerProps {
	asChild?: boolean;
}

export const DialogTrigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(function DialogTrigger({ asChild, ...props }, ref) {
	return (
		<DialogPrimitive.Trigger className={cls.trigger} asChild={asChild} ref={ref} {...props}>
			{props.children}
		</DialogPrimitive.Trigger>
	);
});

export const Dialog = Object.assign(DialogRoot, {
	Content: DialogContent,
	Trigger: DialogTrigger,
	Actions: DialogActions,
	Close: DialogClose,
	Title: DialogTitle,
	Description: DialogDescription,
});
