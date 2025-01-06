import { forwardRef, SVGAttributes } from 'react';

export const RemixGlyph = forwardRef<SVGSVGElement, SVGAttributes<SVGSVGElement>>(function RemixGlyph(props, ref) {
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
			{...props}
			ref={ref}
		>
			<path d="M 4 19 L 18 19 C 19.105 19 20 18.105 20 17 L 20 12" />
			<path d="M 6 16 L 3 19 L 6 22" />
			<path d="M 9 12 L 15 12" />
			<path d="M 12 9 L 12 15" />
			<path d="M 20 5 L 6 5 C 4.895 5 4 5.895 4 7 L 4 12" />
			<path d="M 18 8 L 21 5 L 18 2" />
		</svg>
	);
});
