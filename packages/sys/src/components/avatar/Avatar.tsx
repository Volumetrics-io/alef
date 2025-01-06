import { forwardRef } from 'react';
import { withClassName } from '../../hocs/withClassName.js';
import { BoxProps } from '../box/Box.js';
import cls from './Avatar.module.css';
import clsx from 'clsx';

export interface AvatarProps extends BoxProps {
	src?: string;
	name?: string;
	alt?: string;
	big?: boolean;
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(function Avatar({ className, src, alt, big, name = 'Anonymous', ...props }, ref) {
	return (
		<div ref={ref} {...props} className={clsx(cls.root, big && cls.big, className)}>
			{src ? <AvatarImage crossOrigin="anonymous" src={src} alt={alt ?? `${name}'s avatar`} /> : <AvatarInitials>{initials(name)}</AvatarInitials>}
		</div>
	);
});

export const AvatarImage = withClassName('img', cls.image);
export const AvatarInitials = withClassName('div', cls.initials);

function initials(name: string) {
	return name
		.split(' ')
		.map((word) => word[0])
		.slice(0, 2)
		.join('');
}
