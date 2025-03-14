import { Slot } from '@radix-ui/react-slot';
import { clsx } from 'clsx';
import { ComponentType, ElementType, forwardRef, HTMLAttributes, useMemo } from 'react';
import cls from './Box.module.css';

export type FloatAnchor = 'top-right' | 'top-left' | 'bottom-right' | 'none';
export type SupportedAlignment = 'center' | 'stretch' | 'start' | 'end';
export type SupportedJustification = 'center' | 'start' | 'stretch' | 'between';

export interface BoxProps extends HTMLAttributes<HTMLElement> {
	asChild?: boolean;
	/**
	 * Take up the full parent space.
	 */
	full?: boolean | 'width' | 'height';
	/**
	 * Add padding to the box.
	 */
	padded?: boolean | 'squeeze' | 'small';
	/**
	 * Shorthand for 'padded'
	 */
	p?: boolean | 'squeeze' | 'small';
	/**
	 * Clip the box's children to the box's bounds.
	 */
	clipped?: boolean;
	/**
	 * Add a shadow to the box.
	 */
	elevated?: boolean;
	/**
	 * Round the box's corners.
	 */
	rounded?: boolean | 'full';
	/**
	 * @deprecated: use justify="between"
	 * There's space between the box's children along the main axis.
	 */
	spread?: boolean;
	/**
	 * Applies flex-grow and stretches contents.
	 */
	stretched?: boolean;
	/**
	 * Constrains the horizontal size of the box.
	 */
	constrained?: boolean | 'large';
	/**
	 * Hides the box on mobile.
	 */
	mobileHidden?: boolean;
	/**
	 * The box's children are laid out vertically.
	 */
	stacked?: boolean | 'mobile';
	/**
	 * The box is floated to a corner.
	 */
	float?: FloatAnchor;
	/**
	 * There's space between the box's children.
	 */
	gapped?: boolean;
	/**
	 * The box acts as a logical container (for container queries)
	 */
	container?: boolean;
	/**
	 * Assign a grid area to the box.
	 */
	gridArea?: string;
	/**
	 * Wrap the box's children.
	 */
	wrap?: boolean;
	/**
	 * How contents should align on the cross-axis.
	 */
	align?: SupportedAlignment;
	/**
	 * How contents should align on the main axis.
	 */
	justify?: SupportedJustification;
	/**
	 * Shorthand for align + justify.
	 */
	layout?: `${SupportedAlignment} ${SupportedJustification}`;
	/**
	 * Reverse the layout direction.
	 */
	reverse?: 'mobile' | boolean;

	background?: 'paper' | 'none';

	/**
	 * Adds flex-grow: 1
	 */
	grow?: boolean;

	separated?: boolean;
	as?: ComponentType | ElementType;
}

export const Box = forwardRef<HTMLDivElement, BoxProps>(function Box(
	{
		asChild,
		full,
		padded,
		p = padded,
		clipped,
		elevated,
		rounded,
		spread,
		stretched,
		align,
		justify,
		layout,
		constrained,
		className,
		mobileHidden,
		stacked: stack,
		float,
		gapped,
		as,
		container,
		gridArea,
		style,
		wrap,
		reverse,
		background,
		separated,
		grow,
		...props
	},
	ref
) {
	const Comp = as ? (as as any) : asChild ? Slot : 'div';

	// attempt to memoize style if it's only girdArea
	const gridAreaStyle = useMemo(
		() => ({
			gridArea,
		}),
		[gridArea]
	);
	const appliedStyle = style ? { ...style, gridArea } : gridArea ? gridAreaStyle : undefined;

	const [appliedAlign, appliedJustify] = useMemo(() => {
		if (layout) {
			return layout.split(' ');
		}
		return [align, justify];
	}, [align, justify, layout]);

	const classNames = clsx(
		cls.box,
		{
			[cls.fullWidth]: full === 'width' || full === true,
			[cls.fullHeight]: full === 'height' || full === true,
			[cls.padded]: p === true,
			[cls.paddedSqueeze]: p === 'squeeze',
			[cls.paddedSmall]: p === 'small',
			[cls.clipped]: clipped,
			[cls.elevated]: elevated,
			[cls.rounded]: rounded === true,
			[cls.roundedFull]: rounded === 'full',
			[cls.spread]: spread,
			[cls.stretched]: stretched,
			[cls.grow]: grow,
			[cls.constrained]: constrained === true,
			[cls.constrainedLarge]: constrained === 'large',
			[cls.mobileHidden]: mobileHidden,
			[cls.stack]: stack === true,
			[cls.stackMobile]: stack === 'mobile',
			[cls.float]: !!float,
			[cls.gapped]: gapped,
			[cls.container]: container,
			[cls.wrap]: wrap,
			[cls.backgroundPaper]: background === 'paper',

			[cls.alignCenter]: appliedAlign === 'center',
			[cls.alignStart]: appliedAlign === 'start',
			[cls.alignStretch]: appliedAlign === 'stretch',
			[cls.alignEnd]: appliedAlign === 'end',

			[cls.justifyCenter]: appliedJustify === 'center',
			[cls.justifyStart]: appliedJustify === 'start',
			[cls.justifyStretch]: appliedJustify === 'stretch',
			[cls.justifyBetween]: appliedJustify === 'between',

			[cls.separated]: separated,

			[cls.reverse]: reverse === true,
			[cls.reverseMobile]: reverse === 'mobile',
		},
		className
	);

	return <Comp {...props} ref={ref} data-float={float} className={classNames} style={appliedStyle} />;
});
