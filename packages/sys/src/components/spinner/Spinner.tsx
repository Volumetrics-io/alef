import { forwardRef, SVGAttributes } from 'react';
import cls from './Spinner.module.css';

export interface SpinnerProps extends SVGAttributes<SVGElement> {
	size?: 'icon' | number;
}

export const Spinner = forwardRef<SVGSVGElement, SpinnerProps>(function Spinner({ size, style, className, ...rest }, ref) {
	const realSize = (size === 'icon' ? 24 : size) ?? 40;
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={realSize}
			height={realSize}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={cls.root}
			{...rest}
			ref={ref}
		>
			<circle className={cls.spinner} strokeDasharray="12 12" r="8" cy="12" cx="12" />
		</svg>
	);
});
