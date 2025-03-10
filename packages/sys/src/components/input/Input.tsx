import clsx from 'clsx';
import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { Box, BoxProps } from '../box/Box.js';
import { Control, ControlProps } from '../control/Control.js';
import cls from './Input.module.css';

export type InputVariant = 'default' | 'error';

export type InputProps = (InputFieldProps & InputTextareaFieldProps) & {
	variant?: InputVariant;
	multiline?: boolean;
	disabled?: boolean;
	onValueChange?: (value: string) => void;
};

const InputBase = forwardRef<any, InputProps>(function InputBase({ className, multiline, variant, disabled, onChange, onValueChange, ...props }, ref) {
	const Field = multiline ? InputTextareaField : InputField;

	const handleChange = (event: React.ChangeEvent<any>) => {
		onChange?.(event);
		onValueChange?.(event.target.value);
	};

	return (
		<InputRoot className={className} variant={variant} disabled={disabled}>
			<Field {...props} disabled={disabled} onChange={handleChange} ref={ref} />
		</InputRoot>
	);
});

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
