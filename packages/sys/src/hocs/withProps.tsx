/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentPropsWithoutRef, ComponentType, ElementType, forwardRef } from 'react';

export function withProps<TComponent extends ComponentType<any> | ElementType<any>>(Component: TComponent, baseProps: Partial<ComponentPropsWithoutRef<TComponent>>): TComponent {
	return forwardRef<any, any>(function WithProps(props, ref) {
		// @ts-ignore
		return <Component ref={ref} {...baseProps} {...props} />;
	}) as any;
}
