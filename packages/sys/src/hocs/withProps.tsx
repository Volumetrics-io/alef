/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentPropsWithoutRef, ComponentType, ElementType } from 'react';

export function withProps<TComponent extends ComponentType<any> | ElementType<any>>(Component: TComponent, baseProps: Partial<ComponentPropsWithoutRef<TComponent>>): TComponent {
	return function WithProps(props: any) {
		// @ts-ignore
		return <Component {...baseProps} {...props} />;
	} as any;
}
