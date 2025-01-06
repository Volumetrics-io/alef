import * as RadixCheckbox from '@radix-ui/react-checkbox';
import cls from './Checkbox.module.css';
import { withClassName } from '../../hocs/withClassName.js';
import { forwardRef } from 'react';
import { Control } from '../control/Control.js';
import clsx from 'clsx';

export const CheckboxRoot = forwardRef<HTMLButtonElement, RadixCheckbox.CheckboxProps>(function CheckboxRoot({ className, children, ...rest }, ref) {
	return (
		<Control asChild>
			<RadixCheckbox.Root ref={ref} {...rest} className={clsx(cls.root, className)}>
				{children}
			</RadixCheckbox.Root>
		</Control>
	);
});
export const CheckboxIndicator = withClassName(RadixCheckbox.Indicator, cls.indicator);
export const CheckboxIcon = withClassName('div', cls.icon);

export type CheckboxProps = RadixCheckbox.CheckboxProps;

export const Checkbox = forwardRef<HTMLButtonElement, RadixCheckbox.CheckboxProps>(function Checkbox({ className, children, ...rest }, ref) {
	return (
		<CheckboxRoot ref={ref} {...rest} className={className}>
			<CheckboxIndicator>
				<CheckboxIcon />
			</CheckboxIndicator>
		</CheckboxRoot>
	);
});
