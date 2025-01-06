import * as DialogPrimitive from '@radix-ui/react-dialog';
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
}

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(function DialogContent(props, ref) {
	return (
		<DialogPrimitive.Portal>
			<DialogPrimitive.Overlay className={cls.overlay} />
			<Frame asChild padded stacked gapped elevated ref={ref}>
				<DialogPrimitive.Content className={cls.content}>
					<Box spread>
						<DialogTitle>{props.title}</DialogTitle>
					</Box>
					<DialogClose asChild>
						<Button variant="action" float="top-right">
							<XIcon />
						</Button>
					</DialogClose>
					{props.children}
				</DialogPrimitive.Content>
			</Frame>
		</DialogPrimitive.Portal>
	);
});

export const DialogActions = withProps(Box, {
	spread: true,
});

export const Dialog = Object.assign(DialogRoot, {
	Content: DialogContent,
	Trigger: DialogPrimitive.Trigger,
	Actions: DialogActions,
	Close: DialogClose,
	Title: DialogTitle,
	Description: DialogDescription,
});
