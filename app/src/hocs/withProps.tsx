/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentPropsWithoutRef, ComponentType, forwardRef, ElementType } from 'react';

export function withProps<TComponent extends ComponentType<any> | ElementType<any>>(Component: TComponent, baseProps: Partial<ComponentPropsWithoutRef<TComponent>>): TComponent {
	return forwardRef<any, any>(function WithProps(props, ref) {
		// HOC typings are hard; easier to ignore this.
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		return <Component ref={ref} {...baseProps} {...props} />;
	}) as any;
}
