import { Slot } from '@radix-ui/react-slot';
import clsx from 'clsx';
import dynamicIconImports from 'lucide-react/dynamicIconImports.js';
import { forwardRef, lazy, Suspense, SVGAttributes, useContext } from 'react';
import { ButtonContext } from '../button/ButtonContext.js';
import { ErrorBoundary } from '../errorBoundary/ErrorBoundary.js';
import { Spinner } from '../spinner/Spinner.js';
import { ICON_CLASS_NAME } from './constants.js';
import { CustomIconName, customIcons } from './customGlyphs/index.js';
import cls from './Icon.module.css';
import { IconName, LucideIconName } from './iconNames.js';

export type { IconName } from './iconNames.js';

export interface IconProps extends SVGAttributes<SVGSVGElement> {
	name?: IconName;
	disabledButtonSpinner?: boolean;
	absoluteStrokeWidth?: boolean;
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon({ name, className, children, disabledButtonSpinner, absoluteStrokeWidth, ...rest }, ref) {
	// detect if we're inside a loading button, and replace with a spinner if so.
	const { loading } = useContext(ButtonContext);

	if (loading && !disabledButtonSpinner) {
		return <Spinner size="icon" className={clsx(ICON_CLASS_NAME, cls.icon, className)} {...rest} ref={ref} />;
	}

	if (children) {
		// the user has passed custom content to Icon. it could be anything (not just an SVG),
		// but the purpose here is to apply the icon class so that it's recognized by other
		// parts of Sys as an icon.
		return (
			<Slot className={clsx(ICON_CLASS_NAME, cls.icon, className)} {...(rest as any)}>
				{children}
			</Slot>
		);
	}

	// with no name and no custom children, render a fallback icon.
	if (!name) {
		return <IconFallback ref={ref} />;
	}

	if (customIcons[name as CustomIconName]) {
		const CustomIcon = customIcons[name as CustomIconName];
		return <CustomIcon {...rest} className={clsx(ICON_CLASS_NAME, cls.icon, className)} vectorEffect={absoluteStrokeWidth ? 'non-scaling-stroke' : undefined} ref={ref} />;
	}

	// @ts-ignore -- something's up with Lucide package typings, but this does work.
	if (!dynamicIconImports[name]) {
		console.warn(`Icon "${name}" not found`);
		return <IconFallback ref={ref} />;
	}
	// @ts-ignore -- something's up with Lucide package typings, but this does work.
	const LucideIcon = lazy(dynamicIconImports[name as LucideIconName]);

	return (
		<ErrorBoundary fallback={<IconFallback ref={ref} />}>
			<Suspense fallback={<IconFallback ref={ref} />}>
				<LucideIcon {...rest} absoluteStrokeWidth={absoluteStrokeWidth} className={clsx(ICON_CLASS_NAME, cls.icon, className)} ref={ref} />
			</Suspense>
		</ErrorBoundary>
	);
});

export const IconFallback = forwardRef<SVGSVGElement, SVGAttributes<SVGSVGElement>>(function IconFallback({ className, ...rest }, ref) {
	return (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			xmlns="http://www.w3.org/2000/svg"
			ref={ref}
			className={clsx(ICON_CLASS_NAME, cls.icon, className)}
			{...rest}
		/>
	);
});
