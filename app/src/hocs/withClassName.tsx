/* eslint-disable @typescript-eslint/no-explicit-any */
import classNames from 'clsx';
import { ComponentPropsWithRef, ComponentType, ElementType, FunctionComponent, forwardRef } from 'react';

export function withClassName<T extends ComponentType<any> | ElementType<any>>(Component: T, ...cs: Parameters<typeof classNames>): FunctionComponent<ComponentPropsWithRef<T>> {
	const WithClassName = forwardRef<any, any>((props, ref) => {
		const { className, ...rest } = props;
		// HOC typings are hard; easier to ignore this.
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		return <Component ref={ref} {...rest} className={classNames(cs, className)} />;
	});
	return WithClassName as any;
}
