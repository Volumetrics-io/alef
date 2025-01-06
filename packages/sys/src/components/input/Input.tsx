import clsx from 'clsx';
import { Control, ControlProps } from '../control/Control.js';
import cls from './Input.module.css';
import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { Box, BoxProps } from '../box/Box.js';

export type InputVariant = 'default' | 'error';

export type InputProps = (InputFieldProps & InputTextareaFieldProps) & {
	variant?: InputVariant;
	multiline?: boolean;
	disabled?: boolean;
};

function InputBase({ className, multiline, variant, disabled, ...props }: InputProps) {
	const Field = multiline ? InputTextareaField : InputField;
	return (
		<InputRoot className={className} variant={variant} disabled={disabled}>
			<Field {...props} disabled={disabled} />
		</InputRoot>
	);
}

export interface InputSlotProps extends BoxProps {}

export function InputSlot({ className, ...rest }: InputSlotProps) {
	return <Box className={clsx(cls.slot, className)} {...rest} />;
}

export interface InputRootProps extends ControlProps {
	variant?: InputVariant;
}

export const InputRoot = forwardRef<HTMLDivElement, InputRootProps>(function InputRoot({ className, variant = 'default', ...rest }, ref) {
	return (
		<Control
			ref={ref}
			focusWithin
			className={clsx(
				cls.root,
				{
					[cls.default]: variant === 'default',
					[cls.error]: variant === 'error',
				},
				className
			)}
			{...rest}
		/>
	);
});

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(function InputField({ className, ...props }, ref) {
	return <input className={clsx(cls.field, className)} {...props} ref={ref} />;
});

export interface InputTextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const InputTextareaField = forwardRef<HTMLTextAreaElement, InputTextareaFieldProps>(function InputTextareaField({ className, ...props }, ref) {
	return <textarea className={clsx(cls.field, cls.textarea, className)} {...props} ref={ref} />;
});

export const Input = Object.assign(InputBase, {
	Root: InputRoot,
	Slot: InputSlot,
	Field: InputField,
	TextareaField: InputTextareaField,
});
