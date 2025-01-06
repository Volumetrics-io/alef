import * as SwitchPrimitive from '@radix-ui/react-switch';
import { withClassName } from '../../hocs/withClassName.js';
import cls from './Switch.module.css';
import { forwardRef } from 'react';

export const SwitchRoot = withClassName(SwitchPrimitive.Root, cls.root);

export const SwitchThumb = withClassName(SwitchPrimitive.Thumb, cls.thumb);

export const Switch = forwardRef<HTMLButtonElement, SwitchPrimitive.SwitchProps>(function Switch({ className, ...props }, ref) {
	return (
		<SwitchRoot {...props} ref={ref}>
			<SwitchThumb className={cls.thumb} />
		</SwitchRoot>
	);
});
