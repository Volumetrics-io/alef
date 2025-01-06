import * as Primitive from '@radix-ui/react-select';
import clsx from 'clsx';
import { forwardRef } from 'react';
import { withClassName } from '../../hocs/withClassName.js';
import { withProps } from '../../hocs/withProps.js';
import { Control } from '../control/Control.js';
import { Icon } from '../icon/Icon.js';
import cls from './Select.module.css';

export const SelectRoot = Primitive.Root;

export const SelectTrigger = forwardRef<HTMLButtonElement, Primitive.SelectTriggerProps>(function SelectTrigger(props, ref) {
	return (
		<Control asChild className={cls.trigger}>
			<Primitive.Trigger ref={ref} {...props} />
		</Control>
	);
});

export interface SelectContentProps extends Primitive.SelectContentProps {
	disablePortal?: boolean;
}

export const SelectContent = forwardRef<HTMLDivElement, SelectContentProps>(function SelectContent({ className, children, disablePortal, ...props }, ref) {
	const mainContent = (
		<Primitive.Content position="popper" sideOffset={8} align="start" {...props} className={clsx(cls.content, className)} ref={ref}>
			<Primitive.Arrow className={cls.arrow} />
			<Primitive.ScrollUpButton className={clsx(cls.scrollButton, cls.scrollUpButton)} asChild>
				<Control>
					<Icon name="chevron-up" />
				</Control>
			</Primitive.ScrollUpButton>
			<Primitive.Viewport className={cls.viewport}>{children}</Primitive.Viewport>
			<Primitive.ScrollDownButton className={clsx(cls.scrollButton, cls.scrollDownButton)} asChild>
				<Control>
					<Icon name="chevron-down" />
				</Control>
			</Primitive.ScrollDownButton>
		</Primitive.Content>
	);

	if (disablePortal) {
		return mainContent;
	}

	return <Primitive.Portal>{mainContent}</Primitive.Portal>;
});

export const SelectValue = Primitive.Value;

export const SelectIcon = withClassName(withProps(Primitive.Icon, { children: <Icon name="chevron-down" /> }), cls.icon);

export const SelectItem = forwardRef<HTMLDivElement, Primitive.SelectItemProps>(function SelectItem({ className, children, asChild, ...props }, ref) {
	return (
		<Primitive.Item asChild ref={ref} className={clsx(cls.item, className)} {...props}>
			<Control asChild={asChild}>
				<Primitive.ItemText>{children}</Primitive.ItemText>
				<Primitive.ItemIndicator className={cls.indicator}>
					<Icon name="check" />
				</Primitive.ItemIndicator>
			</Control>
		</Primitive.Item>
	);
});

export interface SelectBaseProps extends Primitive.SelectProps {
	className?: string;
	id?: string;
	placeholder?: string;
}

const SelectBase = forwardRef<HTMLButtonElement, SelectBaseProps>(function SelectBase({ children, className, id, placeholder = 'Choose...', ...props }, ref) {
	return (
		<SelectRoot {...props}>
			<SelectTrigger className={className} id={id} ref={ref}>
				<SelectValue placeholder={placeholder} />
				<SelectIcon />
			</SelectTrigger>
			<SelectContent>{children}</SelectContent>
		</SelectRoot>
	);
});

export const Select = Object.assign(SelectBase, {
	Trigger: SelectTrigger,
	Icon: SelectIcon,
	Value: SelectValue,
	Root: SelectRoot,
	Item: SelectItem,
});
