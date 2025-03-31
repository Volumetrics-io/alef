import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Slot } from '@radix-ui/react-slot';
import clsx from 'clsx';
import { XIcon } from 'lucide-react';
import { createContext, forwardRef, ReactNode, useContext, useState } from 'react';
import { withClassName } from '../../hocs/withClassName.js';
import { withProps } from '../../hocs/withProps.js';
import { Box } from '../box/Box.js';
import { Button } from '../button/Button.js';
import { Frame } from '../frame/Frame.js';
import cls from './Dialog.module.css';

export const DialogRoot = withClassName(DialogPrimitive.Root, cls.root);

export const DialogClose = DialogPrimitive.Close;

export const DialogTitle = withClassName(DialogPrimitive.Title, cls.title);

export const DialogDescription = DialogPrimitive.Description;

const DialogContainerContext = createContext<HTMLElement | null>(null);
export function DialogContainerProvider({ children }: { children: ReactNode }) {
	const [element, setElement] = useState<HTMLElement | null>(null);
	return (
		<DialogContainerContext.Provider value={element}>
			<Slot ref={setElement}>{children}</Slot>
		</DialogContainerContext.Provider>
	);
}

export interface DialogContentProps extends DialogPrimitive.DialogContentProps {
	title: string;
	width?: 'medium' | 'large';
	container?: HTMLElement | null;
}

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(function DialogContent({ width, title, container: containerFromProps, ...props }, ref) {
	const containerFromContext = useContext(DialogContainerContext);
	const container = containerFromProps || containerFromContext;
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
		<DialogPrimitive.Trigger asChild={asChild} ref={ref} {...props}>
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
	ContainerProvider: DialogContainerProvider,
});
