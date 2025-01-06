import { forwardRef, HTMLAttributes } from 'react';
import { useLinkContext } from './LinkContext.js';
import clsx from 'clsx';
import cls from './Link.module.css';

export interface LinkProps extends Omit<HTMLAttributes<HTMLAnchorElement>, 'href'> {
	search?: Record<string, string | undefined> | ((prev: Record<string, string>) => Record<string, string | undefined>);
	hash?: Record<string, string | undefined> | ((prev: Record<string, string>) => Record<string, string | undefined>);
	text?: boolean;
	to?: string;
	newTab?: boolean;
	appearActive?: boolean;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
	{ to: toPath, search: userSearch, hash: userHash, className, children, text, newTab, appearActive, ...rest },
	ref
) {
	const { pathname: currentPath, origin } = useLinkContext();
	const isActive = toPath && currentPath === toPath;
	const search = typeof userSearch === 'function' ? userSearch(currentSearch()) : userSearch;
	const hash = typeof userHash === 'function' ? userHash(currentHash()) : userHash;
	let to = constructTo(toPath, search, hash);
	if (!toPath || toPath.startsWith('/')) {
		// add origin to relative paths to support navigation away from subdomains
		to = `${origin}${to}`;
	}

	const extraProps = newTab
		? {
				target: '_blank',
				rel: 'noopener noreferrer',
			}
		: {};

	return (
		<a
			ref={ref}
			{...extraProps}
			href={to}
			className={clsx(cls.root, text && cls.text, isActive && cls.active, newTab && cls.external, className)}
			data-active={isActive || appearActive}
			{...rest}
		>
			{children}
		</a>
	);
});

function currentSearch() {
	return [...new URLSearchParams(location.search).entries()].reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {} as Record<string, string>);
}

function fromSearch(search: Record<string, string | undefined>) {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(search)) {
		if (value) {
			params.append(key, value);
		}
	}
	return params.toString();
}

function currentHash() {
	const asParams = new URLSearchParams(location.hash.slice(1));
	return [...asParams.entries()].reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {} as Record<string, string>);
}

function fromHash(hash: string | Record<string, string | undefined>) {
	const params = new URLSearchParams();
	if (typeof hash === 'string') {
		params.append('hash', hash);
	} else {
		for (const [key, value] of Object.entries(hash)) {
			if (value) {
				params.append(key, value);
			}
		}
	}
	return params.toString();
}

function constructTo(to: string | undefined, search: Record<string, string | undefined> | undefined, hash: string | Record<string, string | undefined> | undefined) {
	const searchStr = search && fromSearch(search);
	const hashStr = hash && fromHash(hash);
	return `${to ?? ''}${searchStr ? `?${searchStr}` : ''}${hashStr ? `#${hashStr}` : ''}`;
}
