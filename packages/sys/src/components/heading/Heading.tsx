import clsx from 'clsx';
import { forwardRef, HTMLAttributes } from 'react';
import cls from './Heading.module.css';

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
	level?: 1 | 2 | 3 | 4 | 5;
	as?: 'h1' | 'h2' | 'h3' | 'h4' | 'span';
}

const levelClassName = ['there is no 0', cls.level1, cls.level2, cls.level3, cls.level4, cls.level5];

export const Heading = forwardRef<HTMLHeadElement, HeadingProps>(function Heading({ level, as, className, ...rest }, ref) {
	const Comp = as ? (as as any) : level ? `h${level}` : 'span';
	const levelDefaulted = level ?? 1;
	return <Comp ref={ref} {...rest} className={clsx(cls.root, levelClassName[levelDefaulted], className)} />;
});
