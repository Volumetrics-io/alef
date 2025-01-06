import { Slot } from '@radix-ui/react-slot';
import clsx from 'clsx';
import { forwardRef, HTMLProps } from 'react';
import cls from './Label.module.css';

export interface LabelProps extends HTMLProps<HTMLLabelElement> {
	asChild?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label({ asChild, className, ...rest }, ref) {
	const Comp = asChild ? Slot : 'label';
	return <Comp ref={ref} {...rest} className={clsx(cls.root, className)} />;
});
