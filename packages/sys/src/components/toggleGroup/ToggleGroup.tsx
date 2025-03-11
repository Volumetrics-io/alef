import * as RadixToggleGroup from '@radix-ui/react-toggle-group';
import clsx from 'clsx';
import { forwardRef } from 'react';
import { Box, BoxProps } from '../box/Box';
import { Control, ControlProps } from '../control/Control';
import cls from './ToggleGroup.module.css';

type RootProps = RadixToggleGroup.ToggleGroupMultipleProps | RadixToggleGroup.ToggleGroupSingleProps;
export const ToggleGroupRoot = forwardRef<any, RootProps & BoxProps>(function ToggleGroupRoot({ className, children, ...props }, ref) {
	return (
		<RadixToggleGroup.Root {...props} className={clsx(cls.root, className)} ref={ref} asChild>
			<Box gapped>{children}</Box>
		</RadixToggleGroup.Root>
	);
});

export const ToggleGroupItem = forwardRef<HTMLButtonElement, RadixToggleGroup.ToggleGroupItemProps & ControlProps>(({ className, children, ...props }, ref) => (
	<RadixToggleGroup.Item asChild {...props} ref={ref} className={clsx(cls.item, className)}>
		<Control>{children}</Control>
	</RadixToggleGroup.Item>
));

export const ToggleGroup = Object.assign(ToggleGroupRoot, {
	Item: ToggleGroupItem,
});
