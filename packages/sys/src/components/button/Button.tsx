import { Slot } from '@radix-ui/react-slot';
import clsx from 'clsx';
import { ButtonHTMLAttributes, forwardRef, HTMLAttributes, useCallback, useState } from 'react';
import { withClassName } from '../../hocs/withClassName.js';
import { useMergedRef } from '../../hooks/useMergedRef.js';
import { Control, ControlProps } from '../control/Control.js';
import cls from './Button.module.css';
import { ButtonContext } from './ButtonContext.js';

export type ButtonColor = 'default' | 'suggested' | 'destructive' | 'ghost';
export type ButtonVariant = 'default' | 'action';

export interface ButtonProps extends ControlProps {
	asChild?: boolean;
	color?: ButtonColor;
	variant?: ButtonVariant;
	loading?: boolean;
	type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
}

export const ButtonRoot = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
	{ asChild, color = 'default', variant = 'default', className, children, loading = false, ...rest },
	ref
) {
	const Comp = asChild ? Slot : 'button';

	const [mutationObserver] = useState(() => {
		if (typeof window === 'undefined') {
			return null;
		}
		return new MutationObserver((entries) => applyPartAttributes(entries[0].target as HTMLButtonElement));
	});
	const immediateRef = useCallback(
		(el: HTMLButtonElement | null) => {
			if (el && mutationObserver) {
				mutationObserver.disconnect();
				mutationObserver.observe(el, { childList: true, subtree: true });
				applyPartAttributes(el);
			} else if (mutationObserver) {
				mutationObserver.disconnect();
			}
		},
		[mutationObserver]
	);
	const mergedRef = useMergedRef(ref, immediateRef);

	return (
		<ButtonContext.Provider value={{ loading }}>
			<Control
				asChild
				className={clsx(
					cls.button,
					{
						[cls.default]: color === 'default',
						[cls.suggested]: color === 'suggested',
						[cls.destructive]: color === 'destructive',
						[cls.ghost]: color === 'ghost',
						[cls.action]: variant === 'action',
					},
					className
				)}
				disabled={rest.disabled || loading}
				type="button"
				{...rest}
			>
				<Comp ref={mergedRef}>{children}</Comp>
			</Control>
		</ButtonContext.Provider>
	);
});

function applyPartAttributes(button: HTMLButtonElement) {
	// each child node that's not an icon counts as a label.
	const registry = {
		icon: 0,
		label: 0,
	};
	button.childNodes.forEach((child) => {
		if (child instanceof HTMLElement && child.classList.contains(cls.icon)) {
			registry.icon++;
		} else {
			registry.label++;
		}
	});
	button.setAttribute('data-has-icon', registry.icon > 0 ? 'true' : 'false');
	button.setAttribute('data-has-label', registry.label > 0 ? 'true' : 'false');
}

export interface ButtonIconProps extends HTMLAttributes<HTMLSpanElement> {
	loading?: boolean;
}

export const ButtonResponsiveLabel = withClassName('span', cls.responsiveLabel);

export const Button = Object.assign(ButtonRoot, {
	ResponsiveLabel: ButtonResponsiveLabel,
});
