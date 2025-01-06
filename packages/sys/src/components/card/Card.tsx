import { forwardRef } from 'react';
import { withClassName } from '../../hocs/withClassName.js';
import { withProps } from '../../hocs/withProps.js';
import { Box } from '../box/Box.js';
import { Frame, FrameProps } from '../frame/Frame.js';
import { Text } from '../text/Text.js';
import { Toolbar } from '../toolbar/Toolbar.js';
import cls from './Card.module.css';

export interface CardRootProps extends FrameProps {}

export const CardRoot = forwardRef<HTMLDivElement, CardRootProps>(function CardRoot({ className, children, separated, ...props }, ref) {
	return (
		<Frame ref={ref} container className={cls.root} {...props}>
			<Box stacked separated={separated} className={cls.inner}>
				{children}
			</Box>
		</Frame>
	);
});

export const CardMain = withClassName(
	withProps(Box, {
		stacked: true,
	}),
	cls.main
);

export const CardDetails = withClassName(Toolbar, cls.details);

export const CardMenu = withProps(Box, {
	float: 'top-right',
});

export const CardTitle = withClassName(withProps(Text, { strong: true }), cls.title);

export const CardImage = withClassName('img', cls.image);

export const CardGrid = withClassName(Box, cls.grid);

export const Card = Object.assign(CardRoot, {
	Main: CardMain,
	Details: CardDetails,
	Menu: CardMenu,
	Title: CardTitle,
	Image: CardImage,
	Grid: CardGrid,
});
